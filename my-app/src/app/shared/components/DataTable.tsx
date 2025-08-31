import React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Колонка таблицы:
 * - key: ключ свойства из строки данных (или произвольный id)
 * - header: заголовок колонки
 * - accessor?: если указан, берём значение через функцию
 * - cell?: кастомный рендер ячейки
 * - className?: стили для td/th
 */
export type ColumnDef<T> = {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

export interface DataTableProps<T> {
  /** Данные */
  data: T[];
  /** Определение колонок */
  columns: ColumnDef<T>[];
  /** Ключ строки (строго рекомендуется) */
  rowKey?: (row: T, index: number) => string;
  /** Состояние загрузки */
  isLoading?: boolean;
  /** Сообщение, если данных нет */
  emptyMessage?: React.ReactNode;
  /** Классы обёртки */
  className?: string;
  /** Классы таблицы */
  tableClassName?: string;
  /** Сжатый вариант (меньше отступы) */
  dense?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading,
  emptyMessage = "Нет данных",
  className,
  tableClassName,
  dense = false,
}: DataTableProps<T>) {
  const padding = dense ? "px-3 py-2" : "px-4 py-3";

  return (
    <div
      className={cn(
        "relative overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800",
        className
      )}
    >
      <table
        className={cn(
          "w-full text-left text-sm",
          "divide-y divide-gray-200 dark:divide-gray-800",
          tableClassName
        )}
      >
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "font-semibold text-gray-700 dark:text-gray-200",
                  padding,
                  col.className
                )}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {isLoading ? (
            <tr>
              <td className={cn(padding)} colSpan={columns.length}>
                <div className="flex items-center gap-3">
                  <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                  <span className="text-gray-500">Загрузка…</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className={cn(padding, "text-gray-500")} colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row, i) : String(i)}
                className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
              >
                {columns.map((col) => {
                  const content =
                    col.render?.(row) ??
                    col.cell?.(row) ??
                    col.accessor?.(row) ??
                    (row as any)[col.key];

                  return (
                    <td key={col.key} className={cn("align-middle", padding, col.className)}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
