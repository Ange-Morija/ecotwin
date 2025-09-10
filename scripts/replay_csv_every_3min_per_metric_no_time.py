# Envoie 7 mesures (une par métrique) toutes les 3 min. Pas de 'time'.
import os, time, signal, pandas as pd, requests

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")
API_KEY  = os.getenv("API_KEY", "change-me")
CSV_PATH = os.getenv("CSV_PATH", "web/assets/data.csv")
SLEEP_SEC = int(os.getenv("SLEEP_SEC", "180"))
START_INDEX = int(os.getenv("START_INDEX", "0"))
LOOP = os.getenv("LOOP", "false").lower() == "true"

SENSOR_ID = {
    "temperature":"CAP_TEMP","humidity":"CAP_HUM","pm25":"CAP_PM25","pm10":"CAP_PM10",
    "so2":"CAP_SO2","co":"CAP_CO","o3":"CAP_O3","no2":"CAP_NO2",
}
COLMAP = {"36_temperature":"temperature","37_humidity":"humidity","38_pm25":"pm25","39_pm10":"pm10",
          "41_so2":"so2","42_co":"co","43_o3":"o3","40_no2":"no2"}

stop=False
def _stop(*_): 
    global stop; stop=True
for s in (signal.SIGINT, signal.SIGTERM): 
    signal.signal(s,_stop)

def build_items(row):
    out=[]
    for raw, field in COLMAP.items():
        if raw not in row.index: continue
        v = pd.to_numeric(row[raw], errors="coerce")
        if pd.isna(v): continue
        sid = SENSOR_ID.get(field)
        if not sid: continue
        out.append({"sensor": sid, field: float(v)})
    return out

def send(items):
    if not items: return 0
    r = requests.post(f"{API_BASE}/telemetry/ingest",
                      headers={"Content-Type":"application/json","X-API-Key":API_KEY},
                      json={"items":items}, timeout=30)
    r.raise_for_status()
    return r.json().get("written",0)

def main():
    df = pd.read_csv(CSV_PATH, engine="python")
    #print(f"[per-metric] lignes={len(df)} start={START_INDEX} interval={SLEEP_SEC}s")
    i=START_INDEX
    while not stop:
        if i>=len(df):
            if LOOP: i=0
            else: 
                a = 0 
                #print("[per-metric] terminé."); break
        items = build_items(df.iloc[i])
        try:
            n = send(items)
            #print(f"[per-metric] i={i} -> {n} points")
        except Exception as e:
            #print(f"[per-metric] i={i} ERREUR: {e}")
            a = 0
        i+=1
        for _ in range(SLEEP_SEC):
            if stop: break
            time.sleep(1)
if __name__=="__main__": main()
