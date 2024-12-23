/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { getRevenue } from '@/api/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
interface Props {
    start: Date;
    end: Date;
}

export function BarChart({ start, end }: Props) {
    const [paidRevenue, setPaidRevenue] = useState<number[]>([]);
    const [paidRoommateRevenue, setPaidRoommateRevenue] = useState<number[]>(
        []
    );

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await getRevenue(start, end);
                if (response) {
                    const data = await response.data;

                    // Tạo dữ liệu cho paidRevenue
                    const revenueArray = Array.from(
                        { length: 12 },
                        (_, index) => {
                            const foundMonth = data.paidRevenue.find(
                                (monthly: any) =>
                                    monthly._id.month === index + 1
                            );
                            return foundMonth ? foundMonth.totalRevenue : 0;
                        }
                    );

                    // Tạo dữ liệu cho paidRoommateRevenue
                    const roommateRevenueArray = Array.from(
                        { length: 12 },
                        (_, index) => {
                            const foundMonth = data.paidRoommateRevenue.find(
                                (monthly: any) =>
                                    monthly._id.month === index + 1
                            );
                            return foundMonth ? foundMonth.totalRevenue : 0;
                        }
                    );

                    setPaidRevenue(revenueArray);
                    setPaidRoommateRevenue(roommateRevenueArray);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchRevenueData();
    }, [start, end]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Tổng doanh thu năm ${start.getFullYear()}`,
            },
        },
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Tháng',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Doanh thu (VNĐ)',
                },
            },
        },
    };

    const labels = [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
    ];

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Doanh thu từ bài đăng cho thuê',
                data: paidRevenue,
                backgroundColor: 'rgba(255, 99, 132, 0.5)', // Màu cho paidRevenue
            },
            {
                label: 'Doanh thu từ bài đăng tìm ở ghép',
                data: paidRoommateRevenue,
                backgroundColor: 'rgba(54, 162, 235, 0.5)', // Màu cho paidRoommateRevenue
            },
        ],
    };

    return <Bar options={options} data={data} style={{ height: '360px' }} />;
}
