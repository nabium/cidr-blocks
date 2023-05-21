import { useState } from 'react';
import { parse } from './lib/netaddr';
import NetAddr from './features/netaddr/NetAddr'
import './App.css';

function App() {

  const [address, setAddress] = useState('');
  // last result, may have error
  const [response, setResponse] = useState(null);
  // history of succeeded results, most recent at last
  const [history, setHistory] = useState([]);
  // 0 = response, 1.. = history[length - 1]..
  const [index, setIndex] = useState(0);

  const handleAddressChanged = (e) => {
    setAddress(e.target.value);
  };

  const handleSubmitClicked = (e) => {
    const ret = parse(address);

    if (response && !response.result && history.length !== 0 && ret.source === history[history.length - 1].source) {
      // prev was error and last in history was same as current, pop from history
      setHistory(history.slice(0, -1));
    } else if (response && response.result && response.source !== ret.source) {
      // prev was same as current
      setHistory([...history, response]);
    }

    setResponse(ret);
    setIndex(0);
  };

  const handleClearInputClicked = () => {
    setAddress('');

    // clear error result also
    if (response && !response.result) {
      if (history.length !== 0) {
        setResponse(history[history.length - 1]);
        setHistory(history.slice(0, -1));
      } else {
        setResponse(null);
      }
    }
  };

  const handleClearResultClicked = () => {
    setResponse(null);
    setHistory([]);
    setIndex(0);
  };

  const handleShowLastResultClicked = () => {
    setIndex(0);
  };

  const handleShowNextResultClicked = () => {
    setIndex(Math.max(0, Math.min(history.length, index - 1)));
  };

  const handleShowPrevResultClicked = () => {
    setIndex(Math.max(0, Math.min(history.length, index + 1)));
  };

  const netaddr = (index === 0) ? response : history[history.length - index];

  return (
    <div className="App">
      <h1 className="App-header">
        Get CIDR block from network address
      </h1>
      <div className="App-input">
        <div>
          <input type="text" size="50" maxLength="80"
            value={address} onChange={handleAddressChanged} />
          <button type="button" onClick={handleSubmitClicked}>OK</button>
          <button type="button" title="clear input" onClick={handleClearInputClicked}>Clear</button>
        </div>
        <div>
          ex.) &quot;192.168.1.0/24&quot; or &quot;192.168.1.0-192.168.1.255&quot; or &quot;192.168.1.0 netmask 255.255.255.0&quot;
        </div>
      </div>
      <div className="App-nav">
        <button className="App-nav-btn" type="button" title="show last reuslt"
          disabled={!response || index === 0} onClick={handleShowLastResultClicked}>&lt;&lt;</button>
        <button className="App-nav-btn" type="button" title="show next result"
          disabled={index === 0} onClick={handleShowNextResultClicked}>&lt;</button>
        <button className="App-nav-btn" type="button" title="show previous result"
          disabled={index === history.length} onClick={handleShowPrevResultClicked}>&gt;</button>
        <button className="App-nav-btn" type="button" title="clear results"
          disabled={!response && history.length === 0} onClick={handleClearResultClicked}>X</button>
      </div>
      <div>
        <NetAddr netaddr={netaddr} />
      </div>
    </div>
  );
}

export default App;
