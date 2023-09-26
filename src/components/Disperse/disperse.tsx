import React, { useState } from 'react';
import './disperse.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootswatch/dist/darkly/bootstrap.min.css';

function Disperse() {
    const [text, setText] = useState('');
    const [error, setError] = useState({
        error: '',
        isDuplicateError: false,
    });
    let [address, value] = ["", ""];

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const keepFirstOne = () => {
        const lines = text.split('\n');
        const addressSet = new Set<string>();
        const uniqueLines: string[] = [];

        for (const line of lines) {
            if (line.includes(' '))
                [address, value] = line.split(' ');
            else if (line.includes("="))
                [address, value] = line.split('=');
            else if (line.includes(","))
                [address, value] = line.split(',');

            if (!addressSet.has(address)) {
                uniqueLines.push(line);
                addressSet.add(address);
            }
        }
        setText(uniqueLines.join('\n'));
        setError({ error: "", isDuplicateError: false });
    };

    const combineBalances = () => {
        const lines = text.split('\n');
        const addressMap = new Map<string, number>();

        for (const line of lines) {
            if (line.includes(' '))
                [address, value] = line.split(' ');
            else if (line.includes("="))
                [address, value] = line.split('=');
            else if (line.includes(","))
                [address, value] = line.split(',');

            if (addressMap.has(address)) {
                addressMap.set(address, addressMap.get(address)! + Number(value));
            } else {
                addressMap.set(address, Number(value));
            }
        }
        const uniqueLines = Array.from(addressMap.entries())
            .map(([address, value]) => `${address} ${value}`);

        setText(uniqueLines.join('\n'));
        setError({
            error: '',
            isDuplicateError: false,
        });
    };


    const validateInput = (inputText: string) => {
        let errorString = "";
        const lines = inputText.split('\n');
        let lineNumberWithError = -1;
        const addressMap = new Map<string, number[]>();

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(' '))
                [address, value] = lines[i].split(' ');
            else if (lines[i].includes("="))
                [address, value] = lines[i].split('=');
            else if (lines[i].includes(","))
                [address, value] = lines[i].split(',');

            if (!value || !Number.isInteger(Number(value))) {
                lineNumberWithError = i + 1;
                errorString = errorString + `\nLine ${lineNumberWithError} wrong amount.`;
            }

            // Check the length of the string
            const isLength42 = address.length === 42;
            const startsWith0x = address.startsWith("0x");
            if (!isLength42 || !startsWith0x) {
                if (lineNumberWithError != i + 1) {
                    lineNumberWithError = i + 1;
                    errorString = errorString + `\nLine ${lineNumberWithError} invalid Ethereum address.`;
                }
                else {
                    errorString = errorString.substring(0, errorString.length - 1) + ` and invalid Ethereum address.`;
                }
            }

            if (addressMap.has(address)) {
                addressMap.get(address)?.push(i + 1);
            } else {
                addressMap.set(address, [i + 1]);
            }
        }

        if (lineNumberWithError > 0) {
            setError({ error: errorString, isDuplicateError: false });
        } else {
            const duplicateErrors = Array.from(addressMap.entries())
                .filter((entry) => entry[1].length > 1)
                .map((entry) => `Address "${entry[0]}" encountered duplicate in Line: ${entry[1].join(', ')}`);

            if (duplicateErrors.length > 0) {
                setError({ error: duplicateErrors.join('\n'), isDuplicateError: true });


            } else {
                setError({ error: "", isDuplicateError: false });
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        setError({ error: "", isDuplicateError: false });
        e.preventDefault();
        if (text.trim() === '') {
            setError({ error: 'Text cannot be empty.', isDuplicateError: false })
        } else {
            validateInput(text);
        }
    };

    return (
        <div className='wrap-disperse'>
            <form onSubmit={handleSubmit}>
                <br />
                <div className="d-flex justify-content-between">
                    <h5 className='instruction-txt'>Addresses with amounts</h5>
                    <h5>Upload File</h5>
                </div>

                <div className="line-numbered-textbox">
                    <div className="line-numbers">
                        {text.split('\n').map((line, index) => (
                            <div key={index} className="line-number">
                                {index + 1}
                            </div>
                        ))}
                    </div>
                    <textarea
                        className="text-box"
                        value={text}
                        onChange={handleTextChange}
                        placeholder="Type or paste your text here..."
                    />
                </div>
                <div className="d-flex justify-content-between">
                    <h5 className='instruction-txt'>Separated by "," or " " or "="</h5>
                    <h5>show example</h5>
                </div>
                {error.isDuplicateError && <div className='duplicate-cta'><div className='error-cta' onClick={keepFirstOne}>Keep The First One  </div><div> | </div><div className='error-cta' onClick={combineBalances}>  Combine Balance </div></div>}
                {error.error && <div className="error-message"><pre>{error.error}</pre></div>}
                <br />
                <button className="btn btn-lg btn-ombre" type="submit">Next</button>
            </form>
        </div>
    );
}

export default Disperse;
