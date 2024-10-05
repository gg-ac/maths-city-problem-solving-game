interface ScreenOrientation {
    lock(orientation: string): Promise<void>;
    unlock(): Promise<void>;
}

interface Screen {
    orientation: {
        type: string;
        angle: number;
        lock: (orientation: string) => Promise<void>;
        unlock: () => Promise<void>;
    };
}