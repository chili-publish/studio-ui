import React from 'react';

function Input(props: any) {
    const { onClick, handleChange } = props;
    return <input onClick={onClick} onChange={handleChange} />;
}

export default Input;
