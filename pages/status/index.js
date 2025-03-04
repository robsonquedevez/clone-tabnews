import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <Dependencies />
    </>
  );
}

function UpdatedAt() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let udpatedText = "Loading...";

  if (!isLoading && data) {
    udpatedText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Last update: {udpatedText}</div>;
}

function Dependencies() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  return (
    <div>
      <div>
        <h3>Connections Database</h3>
        <p>
          {isLoading
            ? "loading..."
            : `${data.dependencies.database.opened_connections} / ${data.dependencies.database.max_connections}`}
        </p>
      </div>
      <div>
        <h3>Version Database</h3>
        <p>{isLoading ? "loading..." : data.dependencies.database.version}</p>
      </div>
    </div>
  );
}
