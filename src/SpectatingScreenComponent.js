import { useState, useEffect, memo } from "react";

const SpectatingScreen = () => {
    useEffect(() => {
        console.log("spectating!")
    }, [])

    return (
        <h1>Spectating!</h1>
    )
}

export default SpectatingScreen;