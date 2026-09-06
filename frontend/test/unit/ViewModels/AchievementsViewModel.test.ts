import {renderHook, waitFor} from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {AchievementsViewModelFunc} from '../../../src/ViewModels/AchievementsViewModel';

{/*Copying mocks from FriendsContext.test.tsx */}

const {mockUseAuth, mockShowAchievement, mockGetIcon} = vi.hoisted(() => ({
    mockUseAuth: vi.fn(),
    mockShowAchievement: vi.fn(),
    mockGetIcon:vi.fn((name:string) => `icon:${name}`)
}))

vi.mock("src/context/Achievement/AchievementToastContext", () => ({
    useAchievementToast: () => ({
        showAchievement: mockShowAchievement
    })
}))

vi.mock("src/Modles/AchievementsModel", () => ({
    achievementContent: {
        heading: "Your Achievements"
    }
}))

vi.mock("src/utils/achievementIcon", () => ({
    getIcon: mockGetIcon
}))

type routeHandler = (
    url: string, 
) => {
    ok: boolean;
    json: () => Promise<any>
} | null;

let handlers: routeHandler[] = [];

function jsonRes(ok: boolean, body: any) {
    return {
        ok, json:async() => body
    }
}

function defaultHandlers(): routeHandler[] {
    return [
        (url) => (url === "/api/achievements/me" ? jsonRes(true, []) : null),
        (url) => (url ==="/api/achievements" ? jsonRes(true, []) : null),
    ]
}

function setMockFetch() {
    (globalThis as any).fetch = vi.fn(async(url:string, init?: RequestInit) => {
        for (const h of handlers) {
            const res = h(url);
            if (res) {
                return res as Response;
            }
        }
        return jsonRes(false, {}) as unknown as Response;
    })
}

beforeEach(() => {
    handlers = defaultHandlers();
    setMockFetch();
    mockUseAuth.mockReturnValue({token: 'tokenTest'});
    mockGetIcon.mockClear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
})

afterEach(() => {
    vi.restoreAllMocks(); 
})