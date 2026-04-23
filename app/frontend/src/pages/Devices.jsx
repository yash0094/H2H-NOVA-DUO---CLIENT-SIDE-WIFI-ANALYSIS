"import React, { useEffect, useState } from \"react\";
import { getDevices } from \"../lib/api\";
import {
  DeviceMobileIcon,
  LaptopIcon,
  TelevisionIcon,
  GameControllerIcon,
  SpeakerHifiIcon,
  HouseLineIcon,
  DeviceTabletIcon,
} from \"@phosphor-icons/react\";

const ICONS = {
  phone: DeviceMobileIcon,
  laptop: LaptopIcon,
  tv: TelevisionIcon,
  console: GameControllerIcon,
  speaker: SpeakerHifiIcon,
  iot: HouseLineIcon,
  tablet: DeviceTabletIcon,
};

export default function Devices() {
  const [data, setData] = useState(null);
  useEffect(() => { getDevices().then(setData); }, []);

  return (
    <div className=\"p-4 md:p-8\" data-testid=\"devices-page\">
      <div className=\"label-micro mb-2\">ACCESS LOG</div>
      <h1 className=\"font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase\">Connected Devices</h1>
      <p className=\"font-mono text-xs text-[#A1A1A1] mt-2\">// {data?.count ?? 0} clients present on MyHomeWiFi.</p>

      <div className=\"mt-8 border border-[#2E2E2E]\" data-testid=\"devices-list\">
        <div className=\"hidden md:grid grid-cols-[40px_1fr_100px_160px_120px_100px] gap-4 p-3 border-b border-[#2E2E2E] bg-[#141414]\">
          <span className=\"label-micro\" />
          <span className=\"label-micro\">DEVICE</span>
          <span className=\"label-micro\">TYPE</span>
          <span className=\"label-micro\">MAC</span>
          <span className=\"label-micro\">IP</span>
          <span className=\"label-micro text-right\">BANDWIDTH</span>
        </div>
        {data?.devices?.map((d) => {
          const Icon = ICONS[d.type] || HouseLineIcon;
          return (
            <div
              key={d.id}
              className=\"grid grid-cols-[40px_1fr_100px] md:grid-cols-[40px_1fr_100px_160px_120px_100px] gap-4 p-3 md:p-4 border-b border-[#2E2E2E] last:border-b-0 hover:bg-[#141414] items-center\"
              data-testid={`device-${d.id}`}
            >
              <div className=\"w-8 h-8 border border-[#2E2E2E] flex items-center justify-center\">
                <Icon size={16} weight=\"bold\" />
              </div>
              <div>
                <div className=\"font-body text-sm font-semibold\">{d.name}</div>
                <div className=\"font-mono text-[10px] text-[#525252] md:hidden mt-1\">
                  {d.type} / {d.ip} / {d.bandwidth_mbps} Mbps
                </div>
              </div>
              <div className=\"hidden md:block label-micro\">{d.type.toUpperCase()}</div>
              <div className=\"hidden md:block font-mono text-xs text-[#A1A1A1]\">{d.mac}</div>
              <div className=\"hidden md:block font-mono text-xs text-[#A1A1A1]\">{d.ip}</div>
              <div className=\"flex md:block flex-col items-end text-right\">
                <span className={`font-mono text-sm ${d.is_hog ? \"text-[#FF3333]\" : \"text-[#FAFAFA]\"}`}>
                  {d.bandwidth_mbps}
                </span>
                <span className=\"label-micro text-[#525252]\">Mbps</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"
