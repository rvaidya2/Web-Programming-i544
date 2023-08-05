import React, { useEffect } from 'react';
import { Err } from 'cs544-js-utils';
import { Errors } from './utils';
import SpreadsheetWs from './ss-ws';
import App from './App';


const setupLoadFormHandler: React.FC = () => {
  useEffect(() => {
    const errors = new Errors();
    const wsUrlInput = document.querySelector('#ws-url') as HTMLInputElement;
    const ssNameInput = document.querySelector('#ss-name') as HTMLInputElement;
    let ws: SpreadsheetWs;
    let ssName: string;
    const ssForm = document.querySelector('#ss-form')! as HTMLFormElement;

    const handleFormSubmit = async (ev: Event) => {
      ev.preventDefault();
      errors.clear();
      const wsUrl = wsUrlInput.value.trim();
      const ssName = ssNameInput.value.trim();
      if (wsUrl.length === 0 || ssName.length === 0) {
        const msg =
          'both the Web Services Url and Spreadsheet Name must be specified';
        errors.display([new Err(msg, { code: 'BAD_REQ' })]);
      } else {
        const ws = SpreadsheetWs.make(wsUrl);
        // await makeSpreadsheet(ws, ssName); // Assuming makeSpreadsheet is defined elsewhere
      }
    };

    ssForm.addEventListener('submit', handleFormSubmit);

    // Clean up the event listener when the component unmounts
    return () => {
      ssForm.removeEventListener('submit', handleFormSubmit);
    };
  }, []);

  return null; // We don't need to render anything for this component
};

export default setupLoadFormHandler;
