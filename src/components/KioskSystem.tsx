import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import fabinhsLogo from "@/assets/fabinhs-logo.jpg";

interface State {
  building: string;
  floor: number;
  zoom: number;
  tx: number;
  ty: number;
}

const KioskSystem = () => {
  const [state, setState] = useState<State>({ building: 'b1', floor: 1, zoom: 1, tx: 0, ty: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0, show: false });
  const svgRef = useRef<SVGSVGElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastTranslate, setLastTranslate] = useState({ tx: 0, ty: 0 });

  const roomNumberFor = (floor: number, idx: number) => (floor * 100) + idx;
  const roomCode = (bid: string, floor: number, idx: number) => 
    `${bid.toUpperCase()}-${roomNumberFor(floor, idx)}`;

  const buildings = [
    { value: 'b1', label: 'Building 1' },
    { value: 'b2', label: 'Building 2' },
    { value: 'b3', label: 'Building 3' },
    { value: 'b4', label: 'Building 4' },
  ];

  const applyTransform = () => {
    if (svgRef.current) {
      svgRef.current.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.zoom})`;
    }
  };

  const setZoom = (newZoom: number) => {
    const minZ = 0.6, maxZ = 4;
    const z = Math.max(minZ, Math.min(maxZ, newZoom));
    setState(prev => ({ ...prev, zoom: z }));
  };

  const handleWheel = (ev: React.WheelEvent) => {
    ev.preventDefault();
    const delta = ev.deltaY < 0 ? 1.12 : 1/1.12;
    setZoom(state.zoom * delta);
  };

  const handlePointerDown = (ev: React.PointerEvent) => {
    if (ev.button && ev.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: ev.clientX, y: ev.clientY });
    setLastTranslate({ tx: state.tx, ty: state.ty });
  };

  const handlePointerMove = (ev: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = ev.clientX - panStart.x;
    const dy = ev.clientY - panStart.y;
    setState(prev => ({ ...prev, tx: lastTranslate.tx + dx, ty: lastTranslate.ty + dy }));
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const handleRoomClick = (bid: string, floor: number, idx: number, ev: React.MouseEvent) => {
    ev.stopPropagation();
    const code = roomCode(bid, floor, idx);
    setSelectedRoom({ bid, floor, idx, code });
    if (mapWrapRef.current) {
      const rect = mapWrapRef.current.getBoundingClientRect();
      setPopupPos({ 
        x: Math.min(Math.max(8, ev.clientX - rect.left), rect.width - 260), 
        y: Math.min(Math.max(8, ev.clientY - rect.top), rect.height - 120),
        show: true 
      });
    }
  };

  const closePopup = () => {
    setPopupPos(prev => ({ ...prev, show: false }));
    setSelectedRoom(null);
  };

  useEffect(() => {
    applyTransform();
  }, [state.tx, state.ty, state.zoom]);

  const renderRooms = () => {
    const rooms = [];
    const roomsCount = 5;

    if (state.building === 'b4') {
      // Horizontal rooms for Building 4
      const gap = 18, roomW = 230, ry = 100;
      const baseX = 400;
      for (let i = 0; i < roomsCount; i++) {
        const rx = baseX + i * (roomW + gap);
        rooms.push(
          <g key={`room-${i}`}>
            <rect
              x={rx} y={ry} width={roomW} height={40}
              className="fill-[#fff7eb] stroke-[#dc9b5b] stroke-[3] rounded-lg cursor-pointer hover:translate-y-[-6px] transition-all"
              onClick={(ev) => handleRoomClick(state.building, state.floor, i + 1, ev)}
            />
            <text x={rx + roomW/2} y={ry + 20} className="text-[12px] font-bold fill-[#21364f] pointer-events-none" textAnchor="middle" dominantBaseline="middle">
              {roomNumberFor(state.floor, i + 1)}
            </text>
          </g>
        );
      }
    } else {
      // Vertical rooms for Buildings 1, 2, 3
      const buildingData: any = {
        b1: { x: 300, y: 300, w: 220, h: 500 },
        b2: { x: 900, y: 300, w: 260, h: 500 },
        b3: { x: 1450, y: 300, w: 240, h: 500 },
      };
      const building = buildingData[state.building];
      if (building) {
        const padding = 14, gaps = 10;
        const roomHeight = Math.max(28, Math.floor((building.h - padding*2 - gaps*(roomsCount-1))/roomsCount));
        const startY = building.y + (building.h - (roomHeight*roomsCount + gaps*(roomsCount-1)))/2;
        
        for (let i = 0; i < roomsCount; i++) {
          const rx = building.x + padding;
          const ry = Math.round(startY + i*(roomHeight + gaps));
          const rw = Math.max(36, building.w - padding*2);
          
          rooms.push(
            <g key={`room-${i}`}>
              <rect
                x={rx} y={ry} width={rw} height={roomHeight}
                className="fill-[#fff7eb] stroke-[#dc9b5b] stroke-[3] rounded-lg cursor-pointer hover:translate-y-[-6px] transition-all"
                onClick={(ev) => handleRoomClick(state.building, state.floor, i + 1, ev)}
              />
              <text x={rx + rw/2} y={ry + roomHeight/2} className="text-[12px] font-bold fill-[#21364f] pointer-events-none" textAnchor="middle" dominantBaseline="middle">
                {roomNumberFor(state.floor, i + 1)}
              </text>
            </g>
          );
        }
      }
    }
    return rooms;
  };

  return (
    <section id="kiosk" className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-block px-6 py-2 bg-accent/10 rounded-full mb-4">
            <span className="text-accent font-semibold">Digital Campus Navigation</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary">
            Interactive Campus Map
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Navigate through FABINHS with our comprehensive digital map featuring all buildings, floors, and room locations
          </p>
        </div>

        <div className="max-w-7xl mx-auto bg-card rounded-2xl shadow-strong overflow-hidden border border-border/50">
          <div className="grid lg:grid-cols-[380px_1fr] gap-0">
            {/* Left Panel - Controls */}
            <div className="bg-gradient-to-b from-primary/5 via-muted/30 to-transparent border-r border-border p-6 space-y-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                  <img src={fabinhsLogo} alt="FABINHS" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">Navigation Center</div>
                  <div className="text-xs text-muted-foreground">Campus Directory</div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Select Building
                  </label>
                  <Select value={state.building} onValueChange={(value) => setState(prev => ({ ...prev, building: value, floor: 1 }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map(b => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent"></span>
                    Floor Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(f => (
                      <Button
                        key={f}
                        variant={state.floor === f ? "default" : "outline"}
                        onClick={() => setState(prev => ({ ...prev, floor: f }))}
                        className="font-bold h-11"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Rooms
                  </label>
                  <Input
                    type="search"
                    placeholder="Find room or teacher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="border-t border-dashed border-border pt-4">
                <div className="flex justify-between items-center mb-3">
                  <strong className="text-sm">Rooms</strong>
                  <span className="text-xs text-muted-foreground">5</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {Array.from({ length: 5 }, (_, i) => {
                    const code = roomCode(state.building, state.floor, i + 1);
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 rounded-lg border border-border/50 cursor-pointer hover:bg-accent/10 transition-colors"
                        onClick={(ev) => handleRoomClick(state.building, state.floor, i + 1, ev as any)}
                      >
                        <span className="text-sm font-medium">{code}</span>
                        <span className="text-xs text-muted-foreground">{state.building.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="relative h-[600px] lg:h-[760px] bg-gradient-to-br from-muted/20 via-background to-accent/5">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground">
                      {buildings.find(b => b.value === state.building)?.label} - Floor {state.floor}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                      5 rooms available
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setZoom(state.zoom * 1.2)}
                    className="p-2.5 bg-background border border-border text-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md"
                    title="Zoom In"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setZoom(state.zoom / 1.2)}
                    className="p-2.5 bg-background border border-border text-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-sm hover:shadow-md"
                    title="Zoom Out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, zoom: 1, tx: 0, ty: 0 }))}
                    className="p-2.5 bg-accent/10 border border-accent/20 text-accent rounded-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-sm hover:shadow-md font-medium px-4"
                    title="Reset View"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute top-24 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-4 space-y-2">
                <div className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Map Legend
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-[#fff7eb] border-2 border-[#dc9b5b] rounded"></div>
                  <span className="text-muted-foreground">Classrooms</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-[#e8f0fe] border-2 border-[#6a86b6] rounded"></div>
                  <span className="text-muted-foreground">Buildings</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-[#fff4d8] border-2 border-[#c58f17] rounded"></div>
                  <span className="text-muted-foreground">Gymnasium</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 bg-[#dbffe1] border-2 border-[#2ea44f] rounded"></div>
                  <span className="text-muted-foreground">Entrance</span>
                </div>
              </div>

              <div
                ref={mapWrapRef}
                className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing pt-20"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={closePopup}
              >
                <svg
                  ref={svgRef}
                  viewBox="0 0 2000 1200"
                  className="w-full h-full select-none"
                  style={{ transformOrigin: '0 0', transition: isPanning ? 'none' : 'transform 0.18s cubic-bezier(.2,.9,.2,1)' }}
                >
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.15" />
                    </pattern>
                    <linearGradient id="roomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#fff7eb", stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: "#ffe8c5", stopOpacity: 1 }} />
                    </linearGradient>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                    </filter>
                  </defs>
                  <rect width="2000" height="1200" fill="url(#grid)" />
                  {/* Buildings */}
                  <rect id="b4" x="350" y="80" width="1300" height="120" className="fill-[#e8f0fe] stroke-[#6a86b6] stroke-4 rounded-xl" />
                  <text x="1000" y="150" className="text-[20px] font-bold fill-foreground pointer-events-none" textAnchor="middle">B4</text>

                  <rect id="b1" x="300" y="300" width="220" height="500" className="fill-[#e8f0fe] stroke-[#6a86b6] stroke-4 rounded-xl" />
                  <text x="410" y="560" className="text-[20px] font-bold fill-foreground pointer-events-none" textAnchor="middle">B1</text>

                  <rect id="b2" x="900" y="300" width="260" height="500" className="fill-[#e8f0fe] stroke-[#6a86b6] stroke-4 rounded-xl" />
                  <text x="1030" y="560" className="text-[20px] font-bold fill-foreground pointer-events-none" textAnchor="middle">B2</text>

                  <rect id="b3" x="1450" y="300" width="240" height="500" className="fill-[#e8f0fe] stroke-[#6a86b6] stroke-4 rounded-xl" />
                  <text x="1570" y="560" className="text-[20px] font-bold fill-foreground pointer-events-none" textAnchor="middle">B3</text>

                  <rect id="gym" x="700" y="850" width="600" height="220" className="fill-[#fff4d8] stroke-[#c58f17] stroke-[5] rounded-xl" />
                  <text x="1000" y="970" className="text-[20px] font-bold fill-foreground pointer-events-none" textAnchor="middle">GYMNASIUM</text>

                  <rect id="canteen" x="820" y="1100" width="360" height="160" className="fill-[#ffe5e5] stroke-[#cc4b4b] stroke-4 rounded-xl" />
                  <text x="1000" y="1180" className="text-[20px] font-bold fill-foreground pointer-events-none" textAnchor="middle">CANTEEN</text>

                  <rect id="entrance" x="150" y="950" width="250" height="140" className="fill-[#dbffe1] stroke-[#2ea44f] stroke-4 rounded-xl" />
                  <text x="275" y="1030" className="text-[20px] font-bold fill-foreground pointer-events-none" textAnchor="middle">ENTRANCE</text>

                  {/* Rooms */}
                  {renderRooms()}

                  {/* Landmarks & Symbols */}
                  <g className="landmarks">
                    {/* North Arrow */}
                    <g transform="translate(1850, 80)">
                      <circle cx="0" cy="0" r="30" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="2" filter="url(#shadow)" />
                      <path d="M 0,-18 L -6,12 L 0,6 L 6,12 Z" fill="hsl(var(--destructive))" />
                      <path d="M 0,6 L -6,12 L 0,18 L 6,12 Z" fill="hsl(var(--muted-foreground))" opacity="0.4" />
                      <text x="0" y="45" textAnchor="middle" fontSize="14" fill="hsl(var(--foreground))" fontWeight="bold">N</text>
                    </g>
                    
                    {/* Main Entrance Icon */}
                    <g transform="translate(275, 980)">
                      <circle cx="0" cy="0" r="20" fill="hsl(var(--accent))" opacity="0.2" />
                      <path d="M -8,-8 L 0,-14 L 8,-8 L 8,8 L -8,8 Z" fill="hsl(var(--accent))" stroke="hsl(var(--accent-foreground))" strokeWidth="1.5" />
                      <rect x="-3" y="0" width="6" height="8" fill="hsl(var(--accent-foreground))" />
                    </g>
                    
                    {/* Parking Symbol */}
                    <g transform="translate(180, 700)">
                      <rect x="-25" y="-25" width="50" height="50" rx="5" fill="hsl(var(--primary))" opacity="0.9" filter="url(#shadow)" />
                      <text x="0" y="8" textAnchor="middle" fontSize="28" fill="hsl(var(--primary-foreground))" fontWeight="bold">P</text>
                      <text x="0" y="45" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontWeight="bold">PARKING</text>
                    </g>
                    
                    {/* Flag Pole */}
                    <g transform="translate(600, 700)">
                      <line x1="0" y1="0" x2="0" y2="-80" stroke="hsl(var(--muted-foreground))" strokeWidth="3" />
                      <path d="M 0,-80 L 40,-70 L 0,-60 Z" fill="hsl(var(--destructive))" />
                      <circle cx="0" cy="-85" r="4" fill="hsl(var(--accent))" />
                      <text x="0" y="20" textAnchor="middle" fontSize="11" fill="hsl(var(--foreground))" fontWeight="bold">FLAG POLE</text>
                    </g>
                    
                    {/* Scale Indicator */}
                    <g transform="translate(100, 1100)">
                      <line x1="0" y1="0" x2="120" y2="0" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
                      <line x1="0" y1="-6" x2="0" y2="6" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
                      <line x1="120" y1="-6" x2="120" y2="6" stroke="hsl(var(--foreground))" strokeWidth="2.5" />
                      <text x="60" y="-12" textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))" fontWeight="bold">20 meters</text>
                    </g>

                    {/* Restroom Icons */}
                    <g transform="translate(550, 400)">
                      <rect x="-20" y="-15" width="40" height="30" rx="4" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth="1.5" />
                      <text x="0" y="5" textAnchor="middle" fontSize="16" fill="hsl(var(--foreground))">🚻</text>
                    </g>
                  </g>
                </svg>

                {/* Popup */}
                {popupPos.show && selectedRoom && (
                  <div
                    className="absolute z-20 bg-card rounded-lg shadow-strong p-4 min-w-[220px]"
                    style={{ left: `${popupPos.x}px`, top: `${popupPos.y}px` }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="font-bold text-lg mb-2">{selectedRoom.code}</h4>
                    <p className="text-sm text-muted-foreground mb-1">Teacher: TBA</p>
                    <p className="text-sm text-muted-foreground mb-3">Schedule: TBA</p>
                    <Button onClick={closePopup} className="w-full" size="sm">Close</Button>
                  </div>
                )}
              </div>

              {/* Floor Pills */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {[1, 2, 3, 4].map(f => (
                  <Button
                    key={f}
                    variant={state.floor === f ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, floor: f }))}
                    className="font-bold rounded-full"
                  >
                    FLOOR {f}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KioskSystem;
