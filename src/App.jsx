import React, { useEffect, useState, useMemo } from 'react';
import debounce from 'lodash.debounce';
import useTransactionStore from './store/useTransactionStore';
import VirtualGrid from './components/VirtualGrid';
import DebugPanel from './components/DebugPanel';
import './App.css';

function App() {
    const { 
        setTransactions, 
        setFilterMerchant, 
        setFilterStatus, 
        filteredTransactions,
        debugMetrics,
        setDebugMetrics
    } = useTransactionStore();

    const [fps, setFps] = useState(0);

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let frameId;

        const loop = () => {
            frameCount++;
            const now = performance.now();
            const delta = now - lastTime;

            if (delta >= 1000) {
                const currentFps = Math.round((frameCount * 1000) / delta);
                setFps(currentFps);
                setDebugMetrics({ fps: currentFps });
                frameCount = 0;
                lastTime = now;
            }

            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [setDebugMetrics]);

    const debouncedFilter = useMemo(
        () => debounce((val) => setFilterMerchant(val), 300),
        [setFilterMerchant]
    );

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/transactions.json');
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error("Error loading transactions:", error);
            }
        };
        loadData();
    }, [setTransactions]);

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>High-Performance Financial Grid</h1>
                <div className="filter-controls">
                    <input 
                        type="text" 
                        placeholder="Filter by merchant..." 
                        onChange={(e) => debouncedFilter(e.target.value)}
                        data-test-id="filter-merchant"
                        className="filter-input"
                    />
                    <div className="status-buttons">
                        <button onClick={() => setFilterStatus('Completed')} data-test-id="quick-filter-Completed">Completed</button>
                        <button onClick={() => setFilterStatus('Pending')} data-test-id="quick-filter-Pending">Pending</button>
                        <button onClick={() => setFilterStatus('Failed')} data-test-id="quick-filter-Failed">Failed</button>
                        <button onClick={() => setFilterStatus(null)}>Clear</button>
                    </div>
                    <span className="results-count" data-test-id="filter-count">
                        Showing {filteredTransactions.length.toLocaleString()} of 1,000,000 rows
                    </span>
                </div>
            </header>

            <main className="app-main">
                <VirtualGrid />
            </main>

            <DebugPanel 
                fps={fps} 
                renderedRows={debugMetrics?.renderedRows ?? 0} 
                startIndex={debugMetrics?.startIndex ?? 0} 
                totalRows={filteredTransactions?.length ?? 0}
            />
        </div>
    );
}

export default App;
