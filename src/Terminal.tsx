import React, { useState } from 'react';
import './Terminal.css';

const Terminal: React.FC = () => {
  const [command, setCommand] = useState<string>('');
  const [commandResponse, setCommandResponse] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const sendCommandToApi = async (command: string) => {
    /*
    Send the command to the API and format the response to display line breaks
    */
    try {
      const response = await fetch(`/command/${command}`);
      if (!response.ok) {
        throw new Error('Erro ao executar o comando');
      }

      const data = await response.json();
      const formattedData = data.msg.split('\n').map((line: string, index: number) => (
        <span key={index}>
          {line}
          <br />
        </span>
      ));

      setCommandResponse(formattedData);
    } catch (error) {
      console.log(error);
      setCommandResponse("Erro ao se comunicar com a API");
    };
  };

  const handleCommandChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    /*
    Handle command input and reset the history index
    */
    setCommand(event.target.value);
    setHistoryIndex(-1);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    /*
    Handles the functions to be called based on the pressed keys
    */
    if (event.key === 'Enter') {
      /* Add the command to the history and send it to the API */
      setHistory((prevHistory) => [...prevHistory, command]);
      setHistoryIndex(-1);

      sendCommandToApi(command);

      setCommand('');
    } else if (event.key === 'ArrowUp') {
      /* Navigate to the previous command in the history */
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setCommand(history[historyIndex - 1]);
      }
    } else if (event.key === 'ArrowDown') {
      /* Navigate to the next command in the history */
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setCommand(history[historyIndex + 1]);
      } else if (historyIndex === history.length - 1) {
        /* If navigated to the last command in the history, clear the field */
        setHistoryIndex(historyIndex + 1);
        setCommand('');
      };
    };
  };

  return (
    <>
      <div className="terminal">
        <div className="instructions">
          <h1>POC Terminal</h1>
          <p>Type commands below to interact</p>
          <p>Available commands:</p>
          <ul>
            <li><strong>ls</strong>: Lists the files and directories in the current directory</li>
            <li><strong>cat</strong>: Displays the content of a file in the terminal</li>
            <li><strong>mkdir</strong>: Creates a new directory</li>
            <li><strong>touch</strong>: Creates a new empty file or updates the modification time of an existing file</li>
            <li><strong>echo</strong>: Displays a message or value in the terminal</li>
            <li><strong>cd</strong>: Changes the current working directory</li>
            <li><strong>pwd</strong>: Prints the current working directory path</li>
            <li>⇧/⇩: Navigate to the previous/next command in the history</li>
          </ul>
          <hr />
        </div>

        <div className="output">
          {commandResponse && (
            <span className="response">{commandResponse}</span>
          )}
        </div>

        <div className="line">
          <span className="prompt">{'>'} </span>
          <input
            type="text"
            value={command}
            onChange={handleCommandChange}
            onKeyDown={handleKeyPress}
            className="input"
            autoFocus
            spellCheck="false"
          />
        </div>
      </div>
    </>
  )
};

export default Terminal;
