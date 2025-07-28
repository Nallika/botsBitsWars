import React from 'react';
import './Input.scss';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = (props) => (
  <input className="atom-input" {...props} />
);

export default Input; 