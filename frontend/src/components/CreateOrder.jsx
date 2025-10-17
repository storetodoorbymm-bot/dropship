import React, { useState } from 'react';

export default function CreateOrder({ cartItems = [], totalPrice = 0, onPlaceOrder, placing }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [landmark, setLandmark] = useState('');
  const [useGeo, setUseGeo] = useState(false);
  const [locationObj, setLocationObj] = useState(null);
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      setUseGeo(true);
      setLocationObj({ lat, lng: lon });

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await res.json();

        if (data && data.address) {
          const { house_number, road, neighbourhood, city, state, postcode, country } = data.address;
          const detailedAddress = [
            house_number,
            road,
            neighbourhood,
            city,
            state,
            postcode,
            country,
          ].filter(Boolean).join(', ');

          setAddress(detailedAddress);
        }
      } catch (error) {
        console.error('Failed to reverse geocode:', error);
        alert('Could not get address from location');
      }
    }, (error) => {
      alert('Failed to get location: ' + error.message);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !address || !phone) {
      alert('Please fill all required fields.');
      return;
    }
    if (!onPlaceOrder) {
      console.error('onPlaceOrder not provided');
      return;
    }
    onPlaceOrder({
      name,
      address,
      phone,
      landmark,
      location: locationObj
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 mt-0">Confirm Your Order</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
          <div className="mt-2">
            <button type="button" onClick={handleLocation} className="text-sm bg-gray-100 px-3 py-1 rounded">📍 Use my location</button>
            {useGeo && locationObj && (
              <span className="ml-3 text-sm text-gray-600">
                Using coords: {locationObj.lat.toFixed(4)}, {locationObj.lng.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Landmark (optional)</label>
          <input value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <h3 className="text-lg font-semibold">Total: ₹{Number(totalPrice + 100).toFixed(2)} <span className="text-sm text-gray-500">(₹100 Delivery charges)</span></h3>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center shadow-sm">
          <p className="text-sm text-gray-600">Expected Delivery Date</p>
          <p className="text-lg font-semibold text-indigo-700">{formattedDeliveryDate}</p>
        </div>

        <div className="flex gap-3 justify-center">
          <button type="submit" disabled={placing} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
            {placing ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
