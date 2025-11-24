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
    <section id="kiosk" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Information Kiosk System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore Fernando Air Base Integrated National High School campus map
          </p>
        </div>

        <div className="max-w-7xl mx-auto bg-card rounded-2xl shadow-strong overflow-hidden">
          <div className="grid lg:grid-cols-[320px_1fr] gap-0">
            {/* Left Panel - Controls */}
            <div className="bg-gradient-to-b from-muted/50 to-transparent border-r border-border p-6 space-y-6">
              <div className="flex items-center gap-3">
                <img src={fabinhsLogo} alt="FABINHS" className="w-11 h-11 rounded-lg object-cover" />
                <div>
                  <div className="font-bold text-lg">Campus Map</div>
                  <div className="text-sm text-muted-foreground">Welcome</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Select Building</label>
                  <Select value={state.building} onValueChange={(value) => setState(prev => ({ ...prev, building: value, floor: 1 }))}>
                    <SelectTrigger>
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
                  <label className="text-sm text-muted-foreground mb-2 block">Floor</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(f => (
                      <Button
                        key={f}
                        variant={state.floor === f ? "default" : "outline"}
                        onClick={() => setState(prev => ({ ...prev, floor: f }))}
                        className="font-bold"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Search Rooms</label>
                  <Input
                    type="search"
                    placeholder="Find room or teacher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className="relative h-[600px] lg:h-[760px] bg-gradient-to-b from-background to-muted/20">
              <div className="absolute left-4 top-4 z-10 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setState(prev => ({ ...prev, zoom: 1, tx: 0, ty: 0 }))}>Reset</Button>
                <Button variant="secondary" size="sm" onClick={() => setZoom(state.zoom * 1.2)}>+</Button>
                <Button variant="secondary" size="sm" onClick={() => setZoom(state.zoom / 1.2)}>−</Button>
              </div>

              <div className="absolute right-4 top-4 z-10 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-bold shadow-md">
                {state.building.toUpperCase()} • F{state.floor}
              </div>

              <div
                ref={mapWrapRef}
                className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
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
