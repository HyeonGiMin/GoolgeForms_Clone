// formsApi.ts - 설문 폼 관련 API 호출 유틸리티

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:15025";

export type FormSummary = {
    id: string;
    title: string;
    description?: string | null;
    createdAtUtc: string;
};

export type QuestionType =
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "MULTIPLE_CHOICE"
    | "CHECKBOXES"
    | "DROPDOWN"
    | "DATE"
    | "TIME";

export type CreateFormQuestionRequest = {
    title: string;
    type: QuestionType;
    required: boolean;
    options: string[];
};

export type CreateFormRequest = {
    title: string;
    description?: string;
    questions: CreateFormQuestionRequest[];
};

export async function fetchForms(): Promise<FormSummary[]> {
    const response = await fetch(`${API_BASE_URL}/api/forms`);

    if (!response.ok) {
        throw new Error("폼 목록을 불러오지 못했습니다.");
    }

    return (await response.json()) as FormSummary[];
}

export async function createForm(
    payload: CreateFormRequest,
): Promise<FormSummary> {
    const response = await fetch(`${API_BASE_URL}/api/forms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("폼을 생성하지 못했습니다.");
    }

    return (await response.json()) as FormSummary;
}
