import { create } from 'zustand';

const useTransactionStore = create((set, get) => ({
    transactions: [],
    filteredTransactions: [],
    loading: true,
    sortConfig: { key: null, direction: 'asc' },
    filterMerchant: '',
    filterStatus: null,
    pinnedColumns: new Set(),
    selectedIds: new Set(),
    debugMetrics: { fps: 0, renderedRows: 0, startIndex: 0 },

    setTransactions: (data) => {
        set({ 
            transactions: data, 
            filteredTransactions: data, 
            loading: false 
        });
    },

    toggleSort: (key) => {
        const { transactions, sortConfig } = get();
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';

        const sorted = [...transactions].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        set({ 
            sortConfig: { key, direction }, 
            transactions: sorted, 
            filteredTransactions: sorted 
        });
        get().applyFilters();
    },

    setFilterMerchant: (merchant) => {
        set({ filterMerchant: merchant });
        get().applyFilters();
    },

    setFilterStatus: (status) => {
        set({ filterStatus: status });
        get().applyFilters();
    },

    applyFilters: () => {
        const { transactions, filterMerchant, filterStatus } = get();
        let filtered = transactions;
        if (filterMerchant) {
            const lowerMerchant = filterMerchant.toLowerCase();
            filtered = filtered.filter(t => t.merchant.toLowerCase().includes(lowerMerchant));
        }
        if (filterStatus) {
            filtered = filtered.filter(t => t.status === filterStatus);
        }
        set({ filteredTransactions: filtered });
    },

    toggleSelection: (id, isMultiSelect) => {
        const { selectedIds } = get();
        const newSelected = new Set(isMultiSelect ? selectedIds : []);
        if (newSelected.has(id) && isMultiSelect) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        set({ selectedIds: newSelected });
    },

    updateTransaction: (id, updatedFields) => {
        const { transactions, filteredTransactions } = get();
        const updateArray = (arr) => arr.map(t => 
            t.id === id ? { ...t, ...updatedFields } : t
        );
        set({
            transactions: updateArray(transactions),
            filteredTransactions: updateArray(filteredTransactions)
        });
    },

    setDebugMetrics: (metrics) => {
        set((state) => ({
            debugMetrics: { ...state.debugMetrics, ...metrics }
        }));
    },

    togglePin: (key) => {
        const { pinnedColumns } = get();
        const newPinned = new Set(pinnedColumns);
        if (newPinned.has(key)) {
            newPinned.delete(key);
        } else {
            newPinned.add(key);
        }
        set({ pinnedColumns: newPinned });
    }
}));

export default useTransactionStore;
