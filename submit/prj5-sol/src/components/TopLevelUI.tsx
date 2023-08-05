import React from 'react';

function makeLoadForm(wsUrl: string) {
  return (
    <form className="form" id="ss-form">
      <label htmlFor="ws-url">Web Services URL</label>
      <input
        type="text"
        name="ws-url"
        id="ws-url"
        defaultValue={wsUrl}
      />

      <label htmlFor="ss-name">Spreadsheet Name</label>
      <input
        type="text"
        name="ss-name"
        id="ss-name"
      />

      <button type="submit">Load Spreadsheet</button>
    </form>
  );
}

interface TopLevelUIProps {
  wsUrl: string;
}

const TopLevelUI: React.FC<TopLevelUIProps> = ({ wsUrl }) => {
  return (
    <div>
      {makeLoadForm(wsUrl)}
      <ul className="error" id="errors" />
      <div id="ss" />
    </div>
  );
};

export default TopLevelUI;
