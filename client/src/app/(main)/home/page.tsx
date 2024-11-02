'use client';
import { getUser } from '@/api/api';
import React, { useEffect } from 'react';

function HomePage() {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getUser();
                if (response) {
                    console.log('OK');
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    });
    return <div>HomePage</div>;
}

export default HomePage;
