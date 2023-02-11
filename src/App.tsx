import {
  useState,
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  useCallback,
} from "react";
import styled from "styled-components";
import _ from "lodash-es";
import video from "/video/video.mp4";

import { ReactComponent as PlayPauseSvg } from "@/assets/icons/play/play-pause.svg";
import { ReactComponent as PlayStartSvg } from "@/assets/icons/play/play-start.svg";
import { ReactComponent as VolumeMutedSvg } from "@/assets/icons/volume/volume-muted.svg";
import { ReactComponent as VolumeHighSvg } from "@/assets/icons/volume/volume-high.svg";
import { ReactComponent as VolumeLowSvg } from "@/assets/icons/volume/volume-low.svg";
import { ReactComponent as FullScreenCloseSvg } from "@/assets/icons/screen/full-screen-close.svg";
import { ReactComponent as FullScreenOpenSvg } from "@/assets/icons/screen/full-screen-open.svg";
import { ReactComponent as MiniPlayerSvg } from "@/assets/icons/screen/mini-player.svg";
import { ReactComponent as TheaterTallSvg } from "@/assets/icons/screen/theater-tall.svg";
import { ReactComponent as TheaterWideSvg } from "@/assets/icons/screen/theater-wide.svg";
import { ReactComponent as CaptionsSvg } from "@/assets/icons/captions.svg";

const PlayerContainer = styled.div<{ isTheater: boolean; isFull: boolean }>`
  position: relative;
  margin: 0 auto;
  width: 90%;
  max-width: 1000px;

  ${({ isTheater }) =>
    isTheater &&
    `
      width: 100%;
      max-width: initial;
  `}

  ${({ isFull }) =>
    isFull &&
    `
      width: 100%;
      height: 100vh;
      max-width: initial;
  `}
`;

const Video = styled.video`
  background-color: black;
  width: 100%;
  height: 100%;
  display: block;
`;

const Timeline = styled.div<{ passTimePercent: number }>`
  width: 100%;
  height: 100%;
  transform: scaleY(0.6);
  background-color: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s ease-in-out;

  &:after {
    content: "";
    position: absolute;
    /* width: ${({ passTimePercent }) => passTimePercent}%; */
    right: calc(100% - var(--progress-position) * 100%);
    height: 100%;
    top: 0;
    left: 0;
    bottom: 0;
    background-color: red;
    /* transition: width 0.2s; */
  }
`;

const StyledTimelineContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  height: 0.5rem;
  cursor: pointer;

  &:hover {
    ${Timeline} {
      transform: scaleY(1);

      &:after {
        transform: scaleY(1);
      }
    }
  }
`;

const TimelineCursor = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20px;
  z-index: 10;
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
`;

const VolumeSlider = styled.input<{ volume: number }>`
  width: 7rem;
  -webkit-appearance: none;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  background-image: linear-gradient(white, white);
  background-size: ${({ volume }) => `${volume * 100}% 100%`};
  background-repeat: no-repeat;
  cursor: pointer;
`;

const PlayPauseIcon = styled(PlayPauseSvg)``;

const PlayStartIcon = styled(PlayStartSvg)``;

const VolumeHighIcon = styled(VolumeHighSvg)``;

const VolumeLowIcon = styled(VolumeLowSvg)``;

const VolumeMutedIcon = styled(VolumeMutedSvg)``;

const FullScreenCloseIcon = styled(FullScreenCloseSvg)``;

const FullScreenOpenIcon = styled(FullScreenOpenSvg)``;

const MiniPlayerIcon = styled(MiniPlayerSvg)``;

const TheaterTallIcon = styled(TheaterTallSvg)``;

const TheaterWideIcon = styled(TheaterWideSvg)``;

const CaptionsIcon = styled(CaptionsSvg)``;

const LeftPart = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const RightPart = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  position: absolute;
  bottom: 0;
  width: 100%;
  height: 5rem;
`;

const ControlsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  /* opacity: 0; */
  background: rgba(0, 0, 0, 0.2);

  &:hover {
    opacity: 1;
  }

  ${PlayPauseIcon},
  ${PlayStartIcon},

  ${FullScreenCloseIcon},
  ${FullScreenOpenIcon},
  ${MiniPlayerIcon},
  ${TheaterTallIcon},
  ${TheaterWideIcon},
  ${CaptionsIcon} {
    width: 35px;
    height: 35px;
    margin: 0 1.5rem;
    cursor: pointer;
    color: white;
  }

  ${VolumeHighIcon},
  ${VolumeLowIcon},
  ${VolumeMutedIcon} {
    width: 32px;
    height: 32px;
    margin: 0 1.5rem;
    cursor: pointer;
    color: white;
  }
`;

const StyledMiniPlayerButton = styled.div`
  display: flex;
  align-items: center;
`;

const StyledPlayButton = styled.div`
  display: flex;
  align-items: center;
`;

const StyledVolumeButton = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFullScreenButton = styled.div`
  display: flex;
  align-items: center;
`;

const StyledTheaterButton = styled.div`
  display: flex;
  align-items: center;
`;

const TimelineSlider = forwardRef(
  (
    {
      passTimePercent,
      handleMouseUp,
      handleUpdateVideoTime,
    }: {
      passTimePercent: number;
      handleMouseUp: () => void;
      handleUpdateVideoTime: (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
      ) => void;
    },
    ref
  ) => {
    const timelineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(timelineRef.current);
        } else {
          ref.current = timelineRef.current;
        }
      }
    }, [ref]);

    return (
      <StyledTimelineContainer
        ref={timelineRef}
        onMouseDown={(e) => handleUpdateVideoTime(e)}
        onMouseUp={() => handleMouseUp()}
      >
        <TimelineCursor></TimelineCursor>
        <Timeline passTimePercent={passTimePercent}></Timeline>
      </StyledTimelineContainer>
    );
  }
);
const MiniPlayerButton = ({
  isFull,
  handleToggleMiniMode,
}: {
  isFull: boolean;
  handleToggleMiniMode: () => void;
}) => {
  return (
    <StyledMiniPlayerButton onClick={handleToggleMiniMode}>
      {!isFull && <MiniPlayerIcon />}
    </StyledMiniPlayerButton>
  );
};

const PlayButton = ({
  handleTogglePlay,
  isPlay,
}: {
  handleTogglePlay: () => void;
  isPlay: boolean;
}) => {
  return (
    <StyledPlayButton onClick={() => handleTogglePlay()}>
      {isPlay ? <PlayPauseIcon /> : <PlayStartIcon />}
    </StyledPlayButton>
  );
};

const VolumeButton = ({
  volume,
  isMuted,
  handleToggleMute,
}: {
  volume: number;
  isMuted: boolean;
  handleToggleMute: () => void;
}) => {
  return (
    <StyledVolumeButton onClick={handleToggleMute}>
      {isMuted || volume === 0 ? (
        <VolumeMutedIcon />
      ) : (
        <>{volume >= 0.5 ? <VolumeHighIcon /> : <VolumeLowIcon />}</>
      )}
    </StyledVolumeButton>
  );
};

const FullScreenButton = ({
  isFull,
  handleToggleFullMode,
}: {
  isFull: boolean;
  handleToggleFullMode: () => void;
}) => {
  return (
    <StyledFullScreenButton onClick={() => handleToggleFullMode()}>
      {isFull ? <FullScreenCloseIcon /> : <FullScreenOpenIcon />}
    </StyledFullScreenButton>
  );
};

const TheaterButton = ({
  isTheater,
  handleToggleTheaterMode,
}: {
  isTheater: boolean;
  handleToggleTheaterMode: () => void;
}) => {
  return (
    <StyledTheaterButton onClick={() => handleToggleTheaterMode()}>
      {isTheater ? <TheaterWideIcon /> : <TheaterTallIcon />}
    </StyledTheaterButton>
  );
};

interface IVideoOptions {
  volume: number;
  isScrubbing: boolean;
  isTheater: boolean;
  isMuted: boolean;
  isPlay: boolean;
  isPlaying: boolean;
  isMini: boolean;
  isFull: boolean;
  setTime: undefined | number;
  currentTime: number;
  duration: number;
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [videoOptions, setVideoOptions] = useState<IVideoOptions>({
    volume: 0.5,
    isScrubbing: false,
    isTheater: false,
    isMuted: false,
    isPlay: false,
    isPlaying: false,
    isMini: false,
    isFull: false,
    setTime: undefined,
    currentTime: 0,
    duration: 0,
  });
  const {
    isScrubbing,
    volume,
    isMuted,
    isPlay,
    isTheater,
    isFull,
    currentTime,
    duration,
    setTime,
  } = videoOptions;

  const passTimePercent =
    !duration || !currentTime ? 0 : (currentTime / duration) * 100;
console.log("object");
  const handleTogglePlay = () => {
    setVideoOptions((prev) => ({
      ...prev,
      isPlaying: !prev.isPlay,
      isPlay: !prev.isPlay,
    }));
  };

  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setVideoOptions((prev) => ({
      ...prev,
      volume: Number(value),
    }));
  };

  const handleToggleMute = () => {
    setVideoOptions((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const handleToggleTheaterMode = () => {
    setVideoOptions((prev) => ({
      ...prev,
      isTheater: !prev.isTheater,
    }));
  };

  const handleToggleMiniMode = () => {
    const video = videoRef.current;

    if (!video) return;
    video.requestPictureInPicture();
  };

  const handleToggleFullMode = () => {
    setVideoOptions((prev) => ({
      ...prev,
      isFull: !prev.isFull,
    }));
  };

  const handleVideoTime = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { currentTime, duration } = e.target as HTMLVideoElement;

    setVideoOptions((prev) => ({
      ...prev,
      currentTime,
      duration,
    }));
  };

  const handleUpdateVideoTime = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    console.log("mouse down");
    const timeline = timelineRef.current;

    if (!timeline) return;

    const { clientX } = e;
    const { width, x } = timeline.getBoundingClientRect();

    // 不會少於 0，且不會大於 timeline 的寬
    const percent = Math.min(Math.max(0, clientX - x), width) / width;

    // percent * duration(video total time) = currentTime
    const setTime = duration * percent;

    setVideoOptions((prev) => ({
      ...prev,
      isScrubbing: true,
      isPlay: false,
      setTime,
    }));
  };

  const handleVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { duration } = e.target as HTMLVideoElement;

    setVideoOptions((prev) => ({
      ...prev,
      duration,
    }));
  };

  const handleMouseUp = () => {
    console.log("mouseUp");

    setVideoOptions((prev) => ({
      ...prev,
      isScrubbing: false,
      isPlay: prev.isPlaying ? true : false,
    }));
  };

  const handleMouseMove = (e: MouseEvent) => {
    const timeline = timelineRef.current;

    if (!timeline || !isScrubbing) return;
    const { clientX } = e;
    const { width, x } = timeline.getBoundingClientRect();
    console.log({ clientX });
    // 不會少於 0，且不會大於 timeline 的寬
    const percent = Math.min(Math.max(0, clientX - x), width) / width;

    console.log({ percent });

    // percent * duration(video total time) = currentTime
    const setTime = duration * percent;
    timeline.style.setProperty("--progress-position", `${percent}`);
    setVideoOptions((prev) => ({
      ...prev,
      isPlay: false,
      setTime,
    }));
  };

  const throttledHandleMouseMove = _.throttle(handleMouseMove, 60); // Throttle interval is 100ms

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;
    isPlay ? video.play() : video.pause();

    if (setTime !== undefined) {
      video.currentTime = setTime;
      setVideoOptions((prev) => ({
        ...prev,
        setTime: undefined,
      }));
    }
  }, [videoOptions]);

  useEffect(() => {
    console.log("mouse move");
    document.addEventListener("mousemove", throttledHandleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", throttledHandleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isScrubbing]);

  return (
    <PlayerContainer isFull={isFull} isTheater={isTheater}>
      <Video
        ref={videoRef}
        src={video}
        onTimeUpdate={(e) => handleVideoTime(e)}
        onLoadedMetadata={(e) => handleVideoLoaded(e)}
      ></Video>
      <ControlsContainer>
        <ControlsBar>
          <TimelineSlider
            ref={timelineRef}
            handleUpdateVideoTime={handleUpdateVideoTime}
            handleMouseUp={handleMouseUp}
            passTimePercent={passTimePercent}
          />
          <LeftPart>
            <PlayButton isPlay={isPlay} handleTogglePlay={handleTogglePlay} />
            <VolumeContainer>
              <VolumeButton
                volume={volume}
                isMuted={isMuted}
                handleToggleMute={handleToggleMute}
              />
              <VolumeSlider
                volume={isMuted ? 0 : volume}
                type="range"
                min="0"
                max="1"
                step="any"
                value={isMuted ? 0 : volume}
                onChange={handleChangeVolume}
              ></VolumeSlider>
            </VolumeContainer>
          </LeftPart>
          <RightPart>
            <MiniPlayerButton
              isFull={isFull}
              handleToggleMiniMode={handleToggleMiniMode}
            />
            <TheaterButton
              isTheater={isTheater}
              handleToggleTheaterMode={handleToggleTheaterMode}
            />
            <FullScreenButton
              isFull={isFull}
              handleToggleFullMode={handleToggleFullMode}
            />
          </RightPart>
        </ControlsBar>
      </ControlsContainer>
    </PlayerContainer>
  );
}

export default App;
