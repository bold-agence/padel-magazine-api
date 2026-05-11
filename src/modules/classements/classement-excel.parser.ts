import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';

/** Champs alignés sur RankingRow (front) */
export type ClassementLineInput = {
  rank: number;
  playerName: string;
  pointsNow: number;
  tournaments: number;
  previousRank: number;
  pointsPrev: number;
  rankDelta: string;
  pointsDelta: string;
};

type LineField = keyof ClassementLineInput;

const HEADER_ALIASES: Record<LineField, string[]> = {
  rank: ['rank', 'pos', 'position', 'rang', 'place'],
  playerName: ['player', 'joueur', 'nom', 'playername', 'nom du joueur'],
  pointsNow: [
    'pointsnow',
    'points now',
    'points_actuels',
    'points actuels',
    'points',
  ],
  tournaments: ['tournaments', 'tournois', 'nb tournois'],
  previousRank: [
    'previousrank',
    'previous rank',
    'ancien pos',
    'ancien_pos',
    'prev rank',
    'ancienne place',
  ],
  pointsPrev: [
    'pointsprev',
    'points prev',
    'points_prec',
    'points prec',
    'points précédents',
  ],
  rankDelta: [
    'rankdelta',
    'rank delta',
    'evol pos',
    'évol. pos',
    'evol_pos',
    'evolution pos',
  ],
  pointsDelta: [
    'pointsdelta',
    'points delta',
    'evol points',
    'évol. points',
    'evol_points',
    'evolution points',
  ],
};

function normalizeHeader(cell: unknown): string {
  return String(cell ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '');
}

/** Cellule vide, tiret(s) seuls, ou équivalents « sans valeur » */
function isBlankCell(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return true;
    const low = s.toLowerCase();
    if (low === 'n/a' || low === 'na' || low === '#n/a') return true;
    const dashOnly = s.replace(/\s/g, '');
    if (dashOnly.length > 0 && /^[-–—]+$/.test(dashOnly)) return true;
    return false;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return true;
  return false;
}

/** Nombre : cellule vide ou « - » → valeur par défaut (ex. 0 ou rang par défaut). */
function toIntOrDefault(
  value: unknown,
  field: string,
  defaultWhenBlank: number,
): number {
  if (isBlankCell(value)) {
    return defaultWhenBlank;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }
  const raw = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.');
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new BadRequestException(`Nombre invalide pour ${field}: "${value}"`);
  }
  return Math.round(n);
}

/** Texte : vide ou « - » → chaîne vide (joueur optionnel côté fichier). */
function toStrOrEmpty(value: unknown): string {
  if (isBlankCell(value)) return '';
  const s = String(value ?? '').trim();
  return s.length > 200 ? s.slice(0, 200) : s;
}

function toDeltaStr(value: unknown): string {
  if (isBlankCell(value)) return '-';
  const s = String(value ?? '').trim() || '-';
  return s.length > 32 ? s.slice(0, 32) : s;
}

function mapHeaderToField(normalized: string): LineField | null {
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [
    LineField,
    string[],
  ][]) {
    if (aliases.some((a) => normalized === normalizeHeader(a))) {
      return field;
    }
  }
  return null;
}

function buildColumnMap(headerRow: unknown[]): Partial<Record<LineField, number>> {
  const map: Partial<Record<LineField, number>> = {};
  headerRow.forEach((cell, index) => {
    const n = normalizeHeader(cell);
    if (!n) return;
    const field = mapHeaderToField(n);
    if (field && map[field] === undefined) {
      map[field] = index;
    }
  });
  return map;
}

function rowToLine(
  row: unknown[],
  colMap: Partial<Record<LineField, number>>,
  /** Numéro de ligne dans le fichier (1-based, données), pour rang par défaut si la cellule Pos est vide */
  dataRowNumber1Based: number,
): ClassementLineInput {
  const get = (f: LineField): unknown => {
    const idx = colMap[f];
    if (idx === undefined) {
      throw new BadRequestException(`Colonne manquante: ${f}`);
    }
    return row[idx];
  };

  return {
    rank: toIntOrDefault(get('rank'), 'rank', dataRowNumber1Based),
    playerName: toStrOrEmpty(get('playerName')),
    pointsNow: toIntOrDefault(get('pointsNow'), 'pointsNow', 0),
    tournaments: toIntOrDefault(get('tournaments'), 'tournaments', 0),
    previousRank: toIntOrDefault(get('previousRank'), 'previousRank', 0),
    pointsPrev: toIntOrDefault(get('pointsPrev'), 'pointsPrev', 0),
    rankDelta: toDeltaStr(get('rankDelta')),
    pointsDelta: toDeltaStr(get('pointsDelta')),
  };
}

function rowToLineFixedOrder(
  row: unknown[],
  dataRowNumber1Based: number,
): ClassementLineInput {
  if (row.length < 8) {
    throw new BadRequestException(
      'Chaque ligne doit avoir au moins 8 colonnes (ordre fixe: rank, player, pointsNow, tournaments, previousRank, pointsPrev, rankDelta, pointsDelta).',
    );
  }
  return {
    rank: toIntOrDefault(row[0], 'rank', dataRowNumber1Based),
    playerName: toStrOrEmpty(row[1]),
    pointsNow: toIntOrDefault(row[2], 'pointsNow', 0),
    tournaments: toIntOrDefault(row[3], 'tournaments', 0),
    previousRank: toIntOrDefault(row[4], 'previousRank', 0),
    pointsPrev: toIntOrDefault(row[5], 'pointsPrev', 0),
    rankDelta: toDeltaStr(row[6]),
    pointsDelta: toDeltaStr(row[7]),
  };
}

export function parseClassementExcelBuffer(buffer: Buffer): ClassementLineInput[] {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer' });
  } catch {
    throw new BadRequestException('Fichier Excel illisible.');
  }
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new BadRequestException('Le classeur ne contient aucune feuille.');
  }
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  }) as unknown[][];

  if (!rows.length) {
    throw new BadRequestException('La feuille est vide.');
  }

  const headerRow = rows[0] ?? [];
  const colMap = buildColumnMap(headerRow);
  const required: LineField[] = [
    'rank',
    'playerName',
    'pointsNow',
    'tournaments',
    'previousRank',
    'pointsPrev',
    'rankDelta',
    'pointsDelta',
  ];
  const hasAllHeaders = required.every((f) => colMap[f] !== undefined);

  const dataRows = hasAllHeaders ? rows.slice(1) : rows;
  if (!dataRows.length) {
    throw new BadRequestException('Aucune ligne de données.');
  }

  const lines: ClassementLineInput[] = [];
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!Array.isArray(row)) continue;
    const isBlankRow = row.every((c) => isBlankCell(c));
    if (isBlankRow) continue;

    const dataRowNumber1Based = i + 1;

    try {
      const line = hasAllHeaders
        ? rowToLine(row, colMap, dataRowNumber1Based)
        : rowToLineFixedOrder(row, dataRowNumber1Based);
      lines.push(line);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw new BadRequestException(
          `Ligne ${hasAllHeaders ? i + 2 : i + 1}: ${e.message}`,
        );
      }
      throw e;
    }
  }

  if (!lines.length) {
    throw new BadRequestException('Aucune ligne de classement valide.');
  }

  return lines;
}
