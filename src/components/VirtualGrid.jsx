import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import useTransactionStore from '../store/useTransactionStore';
import './VirtualGrid.css';

const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 30;
const BUFFER_ROWS = 10;

const VirtualGrid = () => {
    const { 
        filteredTransactions, 
        loading, 
        toggleSort, 
        toggleSelection, 
        selectedIds,
        updateTransaction,
        setDebugMetrics,
        pinnedColumns,
        togglePin
    } = useTransactionStore();

    const scrollContainerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [editingCell, setEditingCell] = useState(null);

    const totalRows = filteredTransactions.length;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
    const endIndex = Math.min(totalRows, Math.floor((scrollTop + (VISIBLE_ROWS * ROW_HEIGHT)) / ROW_HEIGHT) + BUFFER_ROWS);

    const visibleData = useMemo(() => {
        return filteredTransactions.slice(startIndex, endIndex).map((row, index) => ({
            ...row,
            actualIndex: startIndex + index
        }));
    }, [filteredTransactions, startIndex, endIndex]);

    useEffect(() => {
        setDebugMetrics({
            startIndex,
            renderedRows: visibleData.length
        });
    }, [startIndex, visibleData.length, setDebugMetrics]);

    const onScroll = useCallback((e) => {
        requestAnimationFrame(() => {
            setScrollTop(e.target.scrollTop);
        });
    }, []);

    const handleRowClick = (id, e) => {
        toggleSelection(id, e.ctrlKey || e.metaKey);
    };

    const handleDoubleClick = (rowIndex, columnKey) => {
        setEditingCell({ rowIndex, columnKey });
    };

    const handleEditBlur = (id, columnKey, value) => {
        updateTransaction(id, { [columnKey]: value });
        setEditingCell(null);
    };

    const handleEditKeyDown = (e, id, columnKey, value) => {
        if (e.key === 'Enter') {
            handleEditBlur(id, columnKey, value);
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    if (loading) return <div className="loading">Loading 1 Million Records...</div>;

    const columns = [
        { key: 'id', label: 'ID', width: 80, pinnable: true },
        { key: 'date', label: 'Date', width: 180, pinnable: true },
        { key: 'merchant', label: 'Merchant', width: 250 },
        { key: 'category', label: 'Category', width: 150 },
        { key: 'amount', label: 'Amount', width: 120 },
        { key: 'status', label: 'Status', width: 120 },
        { key: 'description', label: 'Description', width: 400 },
    ];

    const getLeftOffset = (key) => {
        if (key === 'id') return 0;
        if (key === 'date') return 80;
        return 0;
    };

    return (
        <div className="grid-wrapper">
            <div className="grid-header">
                {columns.map(col => {
                    const isPinned = pinnedColumns.has(col.key);
                    return (
                        <div 
                            key={col.key} 
                            className={`header-cell ${isPinned ? 'pinned-column' : ''}`}
                            style={{ 
                                width: col.width,
                                left: isPinned ? getLeftOffset(col.key) : 'auto'
                            }}
                            data-test-id={`header-${col.key}`}
                            onClick={() => toggleSort(col.key)}
                        >
                            <div className="header-label">{col.label}</div>
                            {col.pinnable && (
                                <button 
                                    className={`pin-toggle ${isPinned ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); togglePin(col.key); }}
                                    data-test-id={`pin-column-${col.key}`}
                                    title="Toggle Pin"
                                >
                                    📌
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div 
                className="grid-scroll-container" 
                ref={scrollContainerRef}
                onScroll={onScroll}
                data-test-id="grid-scroll-container"
            >
                <div className="grid-sizer" style={{ height: totalRows * ROW_HEIGHT }} />

                <div 
                    className="grid-row-window"
                    data-test-id="grid-row-window"
                    style={{ transform: `translateY(${startIndex * ROW_HEIGHT}px)` }}
                >
                    {visibleData.map((row) => (
                        <div 
                            key={row.id}
                            className={`grid-row ${selectedIds.has(row.id) ? 'selected' : ''}`}
                            style={{ height: ROW_HEIGHT }}
                            data-test-id={`virtual-row-${row.id}`}
                            data-selected={selectedIds.has(row.id) ? "true" : "false"}
                            onClick={(e) => handleRowClick(row.id, e)}
                        >
                            {columns.map(col => {
                                const isPinned = pinnedColumns.has(col.key);
                                const isEditing = editingCell?.rowIndex === row.actualIndex && editingCell?.columnKey === col.key;
                                return (
                                    <div 
                                        key={col.key} 
                                        className={`grid-cell ${isPinned ? 'pinned-column' : ''}`}
                                        style={{ 
                                            width: col.width,
                                            left: isPinned ? getLeftOffset(col.key) : 'auto'
                                        }}
                                        data-test-id={`cell-${row.actualIndex}-${col.key}`}
                                        onDoubleClick={() => handleDoubleClick(row.actualIndex, col.key)}
                                    >
                                        {isEditing ? (
                                            <input 
                                                autoFocus
                                                className="cell-edit-input"
                                                defaultValue={row[col.key]}
                                                onBlur={(e) => handleEditBlur(row.id, col.key, e.target.value)}
                                                onKeyDown={(e) => handleEditKeyDown(e, row.id, col.key, e.target.value)}
                                            />
                                        ) : (
                                            col.key === 'amount' ? `$${row[col.key].toLocaleString()}` : row[col.key]
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VirtualGrid;
