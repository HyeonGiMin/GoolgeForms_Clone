// formsApi.ts - 설문 폼 관련 API 호출 유틸리티

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:15025";

export type FormSummary = {
    id: string;
    title: string;
    description?: string | null;
    createdAtUtc: string;
};

export type QuestionOption = {
    id: string;
    label: string;
};

export type Question = {
    id: string;
    title: string;
    type: QuestionType;
    required: boolean;
    options: QuestionOption[];
};

export type FormDetail = {
    id: string;
    title: string;
    description?: string | null;
    createdAtUtc: string;
    updatedAtUtc?: string | null;
    questions: Question[];
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

export type UpdateFormQuestionRequest = {
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

export type UpdateFormRequest = {
    title: string;
    description?: string;
    questions: UpdateFormQuestionRequest[];
};

export async function fetchForms(): Promise<FormSummary[]> {
    const response = await fetch(`${API_BASE_URL}/api/forms`);

    if (!response.ok) {
        throw new Error("폼 목록을 불러오지 못했습니다.");
    }

    return (await response.json()) as FormSummary[];
}

export async function fetchFormById(id: string): Promise<FormDetail> {
    const response = await fetch(`${API_BASE_URL}/api/forms/${id}`);

    if (!response.ok) {
        throw new Error("폼을 불러오지 못했습니다.");
    }

    return (await response.json()) as FormDetail;
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

export async function updateForm(
    id: string,
    payload: UpdateFormRequest,
): Promise<FormDetail> {
    const response = await fetch(`${API_BASE_URL}/api/forms/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("폼을 수정하지 못했습니다.");
    }

    return (await response.json()) as FormDetail;
}

export async function deleteForm(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/forms/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("폼을 삭제하지 못했습니다.");
    }
}

// ==================== 응답 관련 API ====================

export type SubmitAnswerDto = {
    questionId: string;
    answer?: string | null;
    selectedOptions?: string[] | null;
};

export type CreateFormResponseRequest = {
    answers: SubmitAnswerDto[];
};

export type ResponseAnswerDto = {
    questionId: string;
    questionTitle: string;
    questionType: string;
    answer: string;
    selectedOptions: string[];
};

export type FormResponseDto = {
    id: string;
    formId: string;
    createdAt: string;
    answers: ResponseAnswerDto[];
};

export type OptionStatisticsDto = {
    optionLabel: string;
    count: number;
    percentage: number;
};

export type QuestionStatisticsDto = {
    questionId: string;
    questionTitle: string;
    questionType: string;
    responseCount: number;
    optionStatistics?: OptionStatisticsDto[] | null;
    textAnswers?: string[] | null;
};

export async function submitResponse(
    formId: string,
    payload: CreateFormResponseRequest,
): Promise<FormResponseDto> {
    const response = await fetch(
        `${API_BASE_URL}/api/forms/${formId}/responses`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
        throw new Error("응답을 제출하지 못했습니다.");
    }

    return (await response.json()) as FormResponseDto;
}

export async function fetchResponses(
    formId: string,
): Promise<FormResponseDto[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/forms/${formId}/responses`,
    );

    if (!response.ok) {
        throw new Error("응답을 불러오지 못했습니다.");
    }

    return (await response.json()) as FormResponseDto[];
}

export async function fetchResponse(
    formId: string,
    responseId: string,
): Promise<FormResponseDto> {
    const response = await fetch(
        `${API_BASE_URL}/api/forms/${formId}/responses/${responseId}`,
    );

    if (!response.ok) {
        throw new Error("응답을 불러오지 못했습니다.");
    }

    return (await response.json()) as FormResponseDto;
}

export async function fetchStatistics(
    formId: string,
): Promise<QuestionStatisticsDto[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/forms/${formId}/statistics`,
    );

    if (!response.ok) {
        throw new Error("통계를 불러오지 못했습니다.");
    }

    return (await response.json()) as QuestionStatisticsDto[];
}

export async function deleteResponse(
    formId: string,
    responseId: string,
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/api/forms/${formId}/responses/${responseId}`,
        {
            method: "DELETE",
        },
    );

    if (!response.ok) {
        throw new Error("응답을 삭제하지 못했습니다.");
    }
}
