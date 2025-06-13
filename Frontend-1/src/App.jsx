import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('booking');
  const [tickets, setTickets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(false);
  const qrRef = useRef(null);
  const searchQrRef = useRef(null);

  const BACKEND_URL = 'https://busticketbyrcy.onrender.com';

  const fareChart = {
    "Kodihalli Gate": 6,
    "BGS Hospital": 6,
    "Omkar Hills": 12,
    "JSS College": 12,
    "Channasandra": 18,
    "Patalamma Temple": 18,
    "Arehalli": 18,
    "Uttarahalli": 23,
    "Chikkalaasandra": 23,
    "Prarthana School": 23,
    "Kadirenahalli Village": 28,
    "Kadirenahalli Cross": 28,
    "Banashankari Bus Stand": 28,
  };

  const destinations = Object.keys(fareChart);

  // Load tickets for admin page
  const loadTickets = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tickets`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading tickets:", error);
      setTickets([]);
    }
  };

  useEffect(() => {
    if (currentPage === 'admin') {
      loadTickets();
    }
  }, [currentPage]);

  // Generate QR Code
  const generateQRCode = (container, text) => {
    if (container && window.QRCode) {
      container.innerHTML = "";
      new window.QRCode(container, {
        text: text,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel?.H || 0
      });
    }
  };

  // Booking Page Component
  const BookingPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      destination: '',
      tickets: 1,
      payment: ''
    });
    const [totalFare, setTotalFare] = useState(0);

    useEffect(() => {
      const fare = fareChart[formData.destination] || 0;
      setTotalFare(fare * formData.tickets);
    }, [formData.destination, formData.tickets]);

    const handleSubmit = async () => {
      if (!formData.name || !formData.destination || !formData.payment) {
        alert('Please fill in all required fields');
        return;
      }
      
      const farePerTicket = fareChart[formData.destination] || 0;
      const total = farePerTicket * formData.tickets;
      const ticketId = "TID" + Date.now();
      const timestamp = new Date().toLocaleString();

      const ticketInfo = {
        name: formData.name,
        destination: formData.destination,
        tickets: formData.tickets,
        totalFare: total,
        ticketId,
        timestamp
      };

      try {
        await fetch(`${BACKEND_URL}/api/tickets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketInfo)
        });
      } catch (error) {
        console.error("Error saving ticket:", error);
      }

      setTicketData(ticketInfo);
      setShowPopup(true);
      setFormData({ name: '', destination: '', tickets: 1, payment: '' });
    };

    useEffect(() => {
      if (showPopup && ticketData && qrRef.current) {
        const ticketURL = `https://yourwebsite.com/ticket?id=${ticketData.ticketId}&to=${encodeURIComponent(ticketData.destination)}`;
        setTimeout(() => generateQRCode(qrRef.current, ticketURL), 100);
      }
    }, [showPopup, ticketData]);

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold mb-4 text-center">WELCOME TO BMTC</h2>
          <h2 className="text-2xl font-bold mb-6 text-center">Digital Ticket</h2>

          <div className="mb-6">
            <p><strong>Bus Number:</strong> KA-41-D-2521</p>
            <p><strong>Route:</strong> Kengeri → Banashankari</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Passenger Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Destination</label>
              <select
                value={formData.destination}
                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select destination</option>
                {destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Number of Tickets</label>
              <input
                type="number"
                min="1"
                value={formData.tickets}
                onChange={(e) => setFormData({...formData, tickets: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Payment Method</label>
              <select
                value={formData.payment}
                onChange={(e) => setFormData({...formData, payment: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">Select</option>
                <option value="upi">UPI</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>

            <div className="text-right font-bold text-blue-600">
              Total Fare: ₹{totalFare}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200"
            >
              Pay
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentPage('view')}
              className="text-blue-600 font-semibold hover:underline"
            >
              🎫 View My Ticket
            </button>
          </div>
        </div>

        {/* Popup */}
        {showPopup && ticketData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm mx-4">
              <h3 className="text-xl font-bold mb-4">Payment Successful 🎉</h3>
              <p className="mb-2">Thank you {ticketData.name}!</p>
              <p>Destination: {ticketData.destination}</p>
              <p>Tickets: {ticketData.tickets}</p>
              <p>Total Fare: ₹{ticketData.totalFare}</p>
              <p><strong>Ticket ID:</strong> {ticketData.ticketId}</p>
              <p><strong>Time of stamp:</strong> {ticketData.timestamp}</p>
              <div ref={qrRef} className="my-4 flex justify-center"></div>
              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition duration-200"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // View Ticket Page Component
  const ViewTicketPage = () => {
    const [searchName, setSearchName] = useState('');

    const handleSearch = async () => {
      if (!searchName.trim()) {
        alert('Please enter a passenger name');
        return;
      }
      
      setSearchError(false);
      setSearchResult(null);

      try {
        const res = await fetch(`${BACKEND_URL}/api/tickets/name/${encodeURIComponent(searchName)}`);
        if (!res.ok) throw new Error();

        const ticket = await res.json();
        setSearchResult(ticket);

        if (searchQrRef.current) {
          setTimeout(() => {
            generateQRCode(searchQrRef.current, `https://yourdomain.com/ticket?name=${encodeURIComponent(ticket.name)}`);
          }, 100);
        }
      } catch {
        setSearchError(true);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Find Your Ticket</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Passenger Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Search Ticket
            </button>
          </div>

          {searchResult && (
            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold mb-2">Ticket Details</h3>
              <p><strong>Name:</strong> {searchResult.name}</p>
              <p><strong>Destination:</strong> {searchResult.destination}</p>
              <p><strong>Tickets:</strong> {searchResult.tickets}</p>
              <p><strong>Total Fare:</strong> ₹{searchResult.totalFare}</p>
              <p><strong>Timestamp:</strong> {new Date(searchResult.timestamp).toLocaleString()}</p>
              <div ref={searchQrRef} className="my-4 flex justify-center"></div>
            </div>
          )}

          {searchError && (
            <div className="text-red-600 text-center mt-4">Ticket not found.</div>
          )}

          <div className="mt-6 text-center space-x-4">
            <button
              onClick={() => setCurrentPage('booking')}
              className="text-blue-600 hover:underline"
            >
              ← Back to Booking
            </button>
            <button
              onClick={() => setCurrentPage('admin')}
              className="text-green-600 hover:underline"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Admin Page Component
  const AdminPage = () => {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">All Booked Tickets</h1>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border">
              <thead className="bg-blue-100 text-gray-800">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Passenger Name</th>
                  <th className="px-4 py-2 border">Destination</th>
                  <th className="px-4 py-2 border">Tickets</th>
                  <th className="px-4 py-2 border">Total Fare (₹)</th>
                  <th className="px-4 py-2 border">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-red-600">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket, index) => (
                    <tr key={ticket.ticketId || index}>
                      <td className="px-4 py-2 border">{index + 1}</td>
                      <td className="px-4 py-2 border">{ticket.name}</td>
                      <td className="px-4 py-2 border">{ticket.destination}</td>
                      <td className="px-4 py-2 border">{ticket.tickets}</td>
                      <td className="px-4 py-2 border">{ticket.totalFare}</td>
                      <td className="px-4 py-2 border">
                        {new Date(ticket.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center space-x-4">
            <button
              onClick={() => setCurrentPage('booking')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              ← Back to Booking
            </button>
            <button
              onClick={loadTickets}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Load QRCode library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'booking':
        return <BookingPage />;
      case 'view':
        return <ViewTicketPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <BookingPage />;
    }
  };

  return renderCurrentPage();
};

export default App;