'use client';
import { getDistrict, getProvince } from '@/api/api';
import React, { useEffect, useRef, useState } from 'react';

interface props {
    setLocation: React.Dispatch<React.SetStateAction<string>>;
}

type Ward = {
    code: number;
    codename: string;
    district_code: number;
    division_type: string;
    name: string;
};

type District = {
    code: number;
    codename: string;
    division_type: string;
    name: string;
    province_code: number;
    wards: Ward[];
};

type Province = {
    code: number;
    codename: string;
    districts: District[];
    division_type: string;
    name: string;
    phone_code: number;
};

function LocationInput({ setLocation }: props) {
    const [province, setProvince] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([]);
    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
    const [filteredWards, setFilteredWards] = useState<Ward[]>([]);
    const provinceInputRef = useRef<HTMLInputElement>(null);
    const districtInputRef = useRef<HTMLInputElement>(null);
    const wardInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownDistrictRef = useRef<HTMLDivElement>(null);
    const dropdownWardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getdata = async () => {
            const response = await getProvince();
            if (response) {
                console.log(response.data);
                setProvince(response.data);
                setFilteredProvinces(response.data);
            }
        };
        getdata();
    }, []);

    //province
    const handleProvinceSearch = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const query = event.target.value.toLowerCase();
        const filtered = province.filter((p) =>
            p.name.toLowerCase().includes(query)
        );
        setFilteredProvinces(filtered);
    };

    const handleProvinceSelect = async (selectedProvince: Province) => {
        if (provinceInputRef.current && dropdownRef.current) {
            provinceInputRef.current.value = selectedProvince.name;
            dropdownRef.current.classList.add('hidden');
        }
        const districtResponse = await getDistrict(selectedProvince.code);
        if (districtResponse) {
            setDistricts(districtResponse.data.districts);
            setFilteredDistricts(districtResponse.data.districts);
            console.log(districtResponse.data.districts);
        }
    };

    //Districts
    const handleDistrictSearch = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const query = event.target.value.toLowerCase();
        const filtered = districts.filter((p) =>
            p.name.toLowerCase().includes(query)
        );
        setFilteredDistricts(filtered);
    };

    const handleDistrictSelect = async (selectedDistrict: District) => {
        console.log(selectedDistrict);
        if (districtInputRef.current && dropdownDistrictRef.current) {
            districtInputRef.current.value = selectedDistrict.name;
            dropdownDistrictRef.current.classList.add('hidden');
            setWards(selectedDistrict.wards);
            setFilteredWards(selectedDistrict.wards);
        }
    };

    //Wards
    const handleWardSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        const filtered = wards.filter((p) =>
            p.name.toLowerCase().includes(query)
        );
        setFilteredWards(filtered);
    };

    const handleWardSelect = async (selectedWard: Ward) => {
        console.log(selectedWard);
        if (wardInputRef.current && dropdownWardRef.current) {
            wardInputRef.current.value = selectedWard.name;
            dropdownWardRef.current.classList.add('hidden');
        }
        if (
            provinceInputRef.current &&
            districtInputRef.current &&
            wardInputRef.current
        ) {
            const ward = wardInputRef.current.value;
            const district = districtInputRef.current.value;
            const province = provinceInputRef.current.value;

            const fullAddress = `${ward}, ${district}, ${province}`;
            setLocation(fullAddress);
        }
    };

    return (
        <div className="grid grid-cols-6 mt-2 gap-3">
            <div className="col-span-2">
                <div className="">Tỉnh, thành phố: </div>
                <div className="relative">
                    <input
                        ref={provinceInputRef}
                        className="px-2 mt-1 py-1 border-2 w-full rounded-[10px] outline-none"
                        type="text"
                        placeholder="VD: Thành phố Hà Nội"
                        onChange={handleProvinceSearch}
                        onBlur={() => {
                            setTimeout(() => {
                                if (!dropdownRef.current?.matches(':hover')) {
                                    dropdownRef.current?.classList.add(
                                        'hidden'
                                    );
                                }
                            }, 50);
                        }}
                        onClick={() => {
                            if (dropdownRef.current) {
                                dropdownRef.current.classList.remove('hidden');
                            }
                        }}
                    />
                    <div
                        ref={dropdownRef}
                        className="absolute hidden overflow-y-auto  w-full h-[9.7rem] top-[-9.7rem] shadow-custom-light bg-white border-2 rounded outline-none"
                    >
                        {filteredProvinces.map((province, index) => (
                            <div
                                className="hover:bg-blue-500 px-2 py-1 hover:text-white cursor-pointer"
                                key={index}
                                onClick={() => handleProvinceSelect(province)}
                            >
                                {province.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="col-span-2">
                <div className="">Quận, huyện:</div>
                <div className="relative">
                    <input
                        ref={districtInputRef}
                        className="px-2 mt-1 py-1 border-2 w-full rounded-[10px] outline-none"
                        type="text"
                        placeholder="VD: Gia Lâm"
                        onChange={handleDistrictSearch}
                        onBlur={() => {
                            setTimeout(() => {
                                if (
                                    !dropdownDistrictRef.current?.matches(
                                        ':hover'
                                    )
                                ) {
                                    dropdownDistrictRef.current?.classList.add(
                                        'hidden'
                                    );
                                }
                            }, 50);
                        }}
                        onClick={() => {
                            if (dropdownDistrictRef.current) {
                                dropdownDistrictRef.current.classList.remove(
                                    'hidden'
                                );
                            }
                        }}
                    />
                    <div
                        ref={dropdownDistrictRef}
                        className="absolute overflow-y-auto hidden w-full h-[9.7rem] top-[-9.7rem] shadow-custom-light bg-white border-2 rounded outline-none"
                    >
                        {filteredDistricts.map((district, index) => (
                            <div
                                className="hover:bg-blue-500 px-2 py-1 hover:text-white cursor-pointer"
                                key={index}
                                onClick={() => handleDistrictSelect(district)}
                            >
                                {district.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="col-span-2">
                <div className="">Xã, thị trấn: </div>
                <div className="relative">
                    <input
                        ref={wardInputRef}
                        className="px-2 mt-1 py-1 border-2 w-full rounded-[10px] outline-none"
                        type="text"
                        placeholder="VD:Thị trấn Trâu Quỳ"
                        onChange={handleWardSearch}
                        onBlur={() => {
                            setTimeout(() => {
                                if (
                                    !dropdownWardRef.current?.matches(':hover')
                                ) {
                                    dropdownWardRef.current?.classList.add(
                                        'hidden'
                                    );
                                }
                            }, 50);
                        }}
                        onClick={() => {
                            if (dropdownWardRef.current) {
                                dropdownWardRef.current.classList.remove(
                                    'hidden'
                                );
                            }
                        }}
                    />
                    <div
                        ref={dropdownWardRef}
                        className="absolute overflow-y-auto hidden w-full h-[9.7rem] top-[-9.7rem] shadow-custom-light bg-white border-2 rounded outline-none"
                    >
                        {filteredWards.map((wards, index) => (
                            <div
                                className="hover:bg-blue-500 px-2 py-1 hover:text-white cursor-pointer"
                                key={index}
                                onClick={() => handleWardSelect(wards)}
                            >
                                {wards.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LocationInput;
