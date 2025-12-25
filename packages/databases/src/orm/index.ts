import { sql } from "bun";
import type { Column, Table, TableDefinition, ColumnKey } from "../../types";
import { pg } from "..";
import { InserObject, SelectObject } from "./method";

export function use(tx: Bun.SQL = sql) {
	function select<D extends TableDefinition>(table: Table<D>) {
		return new SelectObject(tx, table)
	}

	async function count<D extends TableDefinition>(table: Table<D>): Promise<number> {
		const [[count]]: [[string]] = await tx`SELECT COUNT(*) FROM ${sql(table.definition.name)}`.values()

		return Number(count);
	}

	function insert<D extends TableDefinition, C extends Column<D, ColumnKey<D>>[]>(table: Table<D>, ...columns: C) {
		return new InserObject(tx, table, columns)
	}

	return {
		select,
		count,
		insert
	};
}

export const { select, count, insert } = use(pg)
