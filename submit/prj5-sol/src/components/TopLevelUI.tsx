import React, { FormEvent, useEffect, useState } from 'react';
import { Errors } from '../utils';
import SpreadsheetWs from '../ss-ws';

interface LoadFormProps {
  wsUrl: string;
}

const LoadForm: React.FC<LoadFormProps> = ({ wsUrl }) => {
  const [ssName, setSsName] = useState(''); // State to hold the spreadsheet name
  const [data, setData] = useState<[string, string, number][]>([]); // State to hold the loaded data
  const [errors, setErrors] = useState<string[]>([]); // State to hold any errors

  useEffect(() => {
    // Create an instance of the Errors class
    const errorsInstance = new Errors();
    
  }, []); // Empty dependency array means this effect runs only once on mount

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Create an instance of the SpreadsheetWs class
      const ws = SpreadsheetWs.make(wsUrl);

      // Load data from the server using the provided ssName and ws instance
      const loadResult = await ws.dumpWithValues(ssName);

      if (!loadResult.isOk) {
        // Handle error if needed
        
      } else {
        // Update the data state with the loaded data
        setData(loadResult.val);
      }
    } catch (error) {
      // Handle error if needed
      console.error('Error fetching data:', error);
      setData([]); // Clear data on error
    }
  };

  return (
    <form className="form" id="ss-form" onSubmit={handleSubmit}>
      <label htmlFor="ws-url">Web Services URL</label>
      <input name="ws-url" id="ws-url" value={wsUrl} readOnly />

      <label htmlFor="ss-name">Spreadsheet Name</label>
      <input
        name="ss-name"
        id="ss-name"
        value={ssName}
        onChange={(e) => setSsName(e.target.value)}
      />
      <label></label>
      <button type="submit">Load Spreadsheet</button>

      {/* Display any errors */}
      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>

      {/* Display the loaded data */}
      <div>
       
        <ul>
          
          {data.map(([cellId, expr, value]) => (
            <li key={cellId}>
              Cell ID: {cellId}, Expression: {expr}, Value: {value}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
};

export default LoadForm;
