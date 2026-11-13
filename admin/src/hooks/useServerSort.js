import { useState, useCallback } from 'react';

const toApi = { ascend: 'asc', descend: 'desc' };
const toAntd = { asc: 'ascend', desc: 'descend' };

/**
 * Column sorting backed by the API's sortBy/sortOrder params, so it sorts the
 * whole result set rather than just the current page.
 *
 *   const { sort, sortable, handleSorter } = useServerSort();
 *   columns: [{ title: 'Name', dataIndex: 'name', ...sortable('name') }]
 *   <Table onChange={(p, f, sorter) => handleSorter(sorter)} />
 *
 * Clearing a column's sort falls back to the default (newest first).
 */
const useServerSort = (defaultField = 'createdAt', defaultOrder = 'desc') => {
	const [sort, setSort] = useState({ sortBy: defaultField, sortOrder: defaultOrder });

	const handleSorter = useCallback(
		(sorter) => {
			const s = Array.isArray(sorter) ? sorter[0] : sorter;
			const field = s?.order ? s.columnKey || s.field : null;
			const next = field
				? { sortBy: Array.isArray(field) ? field.join('.') : field, sortOrder: toApi[s.order] }
				: { sortBy: defaultField, sortOrder: defaultOrder };
			setSort((prev) => (prev.sortBy === next.sortBy && prev.sortOrder === next.sortOrder ? prev : next));
		},
		[defaultField, defaultOrder],
	);

	const sortable = useCallback(
		(field) => ({
			key: field,
			sorter: true,
			sortDirections: ['ascend', 'descend'],
			sortOrder: sort.sortBy === field ? toAntd[sort.sortOrder] : null,
		}),
		[sort],
	);

	return { sort, sortable, handleSorter };
};

export default useServerSort;
