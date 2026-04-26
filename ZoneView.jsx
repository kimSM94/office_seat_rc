// ZoneView.jsx
function ZoneView({ setView, seats, setSelectedSeat, zones }) {
  const [selectedZone, setSelectedZone] = React.useState('개발팀');

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800 flex items-center">
        <button onClick={() => setView('home')} className="p-2 mr-2 text-gray-400 font-bold">← BACK</button>
        <h2 className="text-lg font-bold">{selectedZone} 현황</h2>
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {zones.map(z => (
            <button key={z} onClick={() => setSelectedZone(z)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${selectedZone === z ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>{z}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(seats).filter(([_, d]) => d && d.zone === selectedZone).map(([id, d]) => (
            <div key={id} onClick={() => setSelectedSeat(d)} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center cursor-pointer hover:bg-gray-700">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 shadow-lg
                ${d.status === '근무중' ? 'bg-green-500' : d.status === '휴가' ? 'bg-red-500' : 'bg-yellow-400 text-gray-900'}`}>
                {d.name.substring(1)}
              </div>
              <span className="font-bold text-sm">{d.name}</span>
              <span className="text-xs text-gray-400 mt-1">{id}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}