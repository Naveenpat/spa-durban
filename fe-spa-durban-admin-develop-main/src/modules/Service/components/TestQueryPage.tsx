// pages/bookings.tsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ATMButton } from "src/components/atoms/ATMButton/ATMButton";
import { RootState } from "src/store";

export default function TestQueryPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // filters
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [serviceName, setServiceName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [limit, setLimit] = useState(10);
    const [selectedBranch, setSelectedBranch] = useState("");

    const { outlets } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
           

            const params = new URLSearchParams();
            if (email) params.append("email", email);
            if (mobile) params.append("mobile", mobile);
            if (serviceName) params.append("serviceName", serviceName);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            if (limit) params.append("limit", String(limit));
            if (selectedBranch) params.append("storeId", selectedBranch);

            const url = `${process.env.REACT_APP_BASE_URL}/new/get-all-bookings?${params.toString()}`;

            const res = await fetch(url);
            const data = await res.json();
            setBookings(data.data || []);
        } catch (error) {
            console.error("Error fetching bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
         setLoading(true);
        fetchBookings();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(bookings, null, 2));
        // alert("JSON copied to clipboard!");
    };

    const handleReset = () => {
        setEmail("")
        setMobile("")
        setServiceName("")
        setStartDate("")
        setEndDate("")
        fetchBookings()
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Bookings JSON View</h1>

            {/* Filters */}
            <div className="bg-white shadow rounded-xl p-4 mb-6">
                <h2 className="text-lg font-semibold mb-3">Filters</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Filter by email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                    />
                    <input
                        type="text"
                        placeholder="Filter by mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                    />
                    <input
                        type="text"
                        placeholder="Filter by service name"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                    />
                    <div>
                        <label className="block text-sm mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Limit</label>
                        <input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="border rounded-lg px-3 py-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Branch
                        </label>
                        <div className="relative">
                            <select
                                className="block w-full rounded border border-gray-300 bg-white py-2.5 px-3 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                                <option value="">-- Select Branch --</option>
                                {outlets?.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>

                        </div>
                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <ATMButton
                        onClick={handleReset}
                        variant='outlined'
                    // type="submit"
                    >
                        Reset
                    </ATMButton>
                    <ATMButton
                        onClick={handleFilter}
                        type="submit"
                        isLoading={loading}
                    >
                        Apply Filters
                    </ATMButton>
                </div>
            </div>

            {/* JSON Output with Copy Button */}
            <div className="relative bg-black text-green-400 p-4 rounded-xl shadow max-h-[70vh] overflow-auto">
                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 bg-gray-800 text-white p-2 rounded hover:bg-gray-700"
                    title="Copy JSON"
                >
                    📋
                </button>

                {loading ? (
                    <p className="text-white">Loading...</p>
                ) : bookings.length === 0 ? (
                    <p className="text-red-400">No bookings found</p>
                ) : (
                    <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(bookings, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}
