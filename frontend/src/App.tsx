import {useEffect, useState} from "react";
import "./App.css";
import {LiveKitRoom, VideoConference} from "@livekit/components-react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {isPresent} from "../utils";
import * as R from "ramda";
import {objectToSearchString} from "serialize-query-params";

const queryClient = new QueryClient();

type ExampleProps = {
  backendUrl: string;
};
const Example = (props: ExampleProps) => {
  const getTokenUrl = new URL(
    `getToken?${objectToSearchString({
      roomName: "wwww-wwww",
      identity: "user",
      name: "name",
      metadata: "metadata",
    })}`,
    props.backendUrl
  );
  const getServerUrl = new URL(
    `getServerUrl?${objectToSearchString({
      region: "NA",
    })}`,
    props.backendUrl
  );

  const {isLoading, error, data} = useQuery({
    queryKey: ["token"],
    queryFn: async () => {
      const res = await fetch(getTokenUrl);
      const data = await res.json();

      const res2 = await fetch(getServerUrl);
      const data2 = await res2.json();

      return {
        token: data.token,
        liveKitUrl: data2.url,
      };
    },
  });

  if (isLoading) return <h1>Loading...</h1>;

  if (error) return <h1>An error has occurred</h1>;

  return (
    <LiveKitRoom
      token={data!.token}
      serverUrl={data!.liveKitUrl}
      connect={true}>
      <VideoConference />
    </LiveKitRoom>
  );
};

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
  if (R.not(isPresent(backendUrl))) {
    return <h1>BACKEND_URL env var not present</h1>;
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Example backendUrl={backendUrl} />
      </QueryClientProvider>
    </>
  );
}

export default App;
