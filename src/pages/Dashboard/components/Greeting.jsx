import React from 'react';

const Greeting = ({ name }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                {greeting}, {name || 'there'}
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                {today}
            </p>
        </div>
    );
};

export default Greeting;
