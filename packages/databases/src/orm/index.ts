import { sql } from "bun";
import type { Column, Table, TableDefinition, ColumnKey } from "../../types";
import { pg } from "..";
import { DeleteObject, InserObject, SelectObject, UpdateObject } from "./method";

export function use(tx: Bun.SQL = sql) {
	function select<D extends TableDefinition>(table: Table<D>) {
		return new SelectObject(tx, table)
	}

	async function count<D extends TableDefinition>(table: Table<D>): Promise<number> {
		const [[count]]: [[string]] = await tx`SELECT COUNT(*) FROM ${sql(table.definition.name)}`.values()

		return Number(count);
	}

	function insert<D extends TableDefinition, C extends Column<D, ColumnKey<D>>[]>(table: Table<D>, ...columns: C) {
		if (columns.length == 0) {
			return new InserObject(tx, table, [...Object.values(table.columns)] as const)
		}

		return new InserObject(tx, table, columns)
	}

	function update<D extends TableDefinition, C extends Column<D, ColumnKey<D>>[]>(table: Table<D>, ...columns: C) {
		if (columns.length == 0) {
			return new UpdateObject(tx, table, [...Object.values(table.columns)] as const)
		}

		return new UpdateObject(tx, table, columns);
	}

	function del<D extends TableDefinition>(table: Table<D>) {
		return new DeleteObject(tx, table)
	}

	return {
		select,
		count,
		insert,
		update,
		del
	};
}

export const { select, count, insert, del } = use(pg)
