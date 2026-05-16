import React from 'react';
import './DebugPanel.css';

const DebugPanel = ({ fps, renderedRows, startIndex, totalRows }) => {
    return (
        <div className="debug-panel" data-test-id="debug-panel">
            <div className="debug-item">
                <strong>FPS:</strong> 
                <span data-test-id="debug-fps" className={fps < 50 ? 'fps-low' : 'fps-high'}>
                    {fps}
                </span>
            </div>
            <div className="debug-item">
                <strong>Rendered Rows:</strong> 
                <span data-test-id="debug-rendered-rows">
                    {renderedRows}
                </span>
            </div>
            <div className="debug-item">
                <strong>Scroll Position:</strong> 
                <span data-test-id="debug-scroll-position">
                    Row {startIndex.toLocaleString()} / {totalRows.toLocaleString()}
                </span>
            </div>
        </div>
    );
};

export default DebugPanel;
