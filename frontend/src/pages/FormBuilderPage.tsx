// FormBuilderPage.tsx - 새 설문 폼을 생성/편집하는 페이지
import { FormEvent, useMemo, useState } from 'react'
import { createForm, type CreateFormQuestionRequest, type QuestionType } from '../api/formsApi'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Form, Stack } from 'react-bootstrap'

type QuestionOption = {
  id: string
  label: string
}

type Question = {
  id: string
  title: string
  type: QuestionType
  required: boolean
  options: QuestionOption[]
}

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  SHORT_TEXT: '단답형',
  LONG_TEXT: '장문형',
  MULTIPLE_CHOICE: '객관식',
  CHECKBOXES: '체크박스',
  DROPDOWN: '드롭다운',
  DATE: '날짜',
  TIME: '시간',
}

export const FormBuilderPage = () => {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [questions, setQuestions] = useState<Question[]>([])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!title.trim()) {
      setError('제목은 필수입니다.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const questionsPayload: CreateFormQuestionRequest[] = questions.map((q) => ({
        title: q.title.trim() || '제목 없는 질문',
        type: q.type,
        required: q.required,
        options: q.options
          .map((o) => o.label.trim())
          .filter((label) => label.length > 0),
      }))

      await createForm({
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questionsPayload,
      })

      navigate('/forms')
    } catch (err) {
      console.error(err)
      setError('폼 생성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      title: '제목 없는 질문',
      type: 'SHORT_TEXT',
      required: false,
      options: [],
    }

    setQuestions((prev) => [...prev, newQuestion])
  }

  const handleChangeQuestionTitle = (id: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, title: value } : q)),
    )
  }

  const handleChangeQuestionType = (id: string, type: QuestionType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q

        // 선택지 타입에서만 options 사용
        const isOptionType =
          type === 'MULTIPLE_CHOICE' ||
          type === 'CHECKBOXES' ||
          type === 'DROPDOWN'

        return {
          ...q,
          type,
          options: isOptionType
            ? q.options.length > 0
              ? q.options
              : [
                  { id: crypto.randomUUID(), label: '옵션 1' },
                  { id: crypto.randomUUID(), label: '옵션 2' },
                ]
            : [],
        }
      }),
    )
  }

  const handleToggleRequired = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, required: !q.required } : q,
      ),
    )
  }

  const handleAddOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q

        const nextIndex = q.options.length + 1
        return {
          ...q,
          options: [
            ...q.options,
            { id: crypto.randomUUID(), label: `옵션 ${nextIndex}` },
          ],
        }
      }),
    )
  }

  const handleChangeOptionLabel = (
    questionId: string,
    optionId: string,
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q

        return {
          ...q,
          options: q.options.map((opt) =>
            opt.id === optionId ? { ...opt, label: value } : opt,
          ),
        }
      }),
    )
  }

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q

        return {
          ...q,
          options: q.options.filter((opt) => opt.id !== optionId),
        }
      }),
    )
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const hasQuestions = useMemo(() => questions.length > 0, [questions])

  return (
    <section>
      <header className="mb-3">
        <h1 className="h4 mb-1">새 설문지</h1>
        <p className="text-muted mb-0">제목과 설명을 입력하고 질문을 추가해서 설문 폼을 구성합니다.</p>
      </header>

      <Stack gap={3} as="form" onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <Card.Body>
            <Stack gap={3}>
              <Form.Group controlId="formTitle">
                <Form.Label>제목</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="설문 폼 제목을 입력하세요"
                />
              </Form.Group>

              <Form.Group controlId="formDescription">
                <Form.Label>설명</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="선택 사항: 설문에 대한 설명을 입력하세요"
                />
              </Form.Group>
            </Stack>
          </Card.Body>
        </Card>

        <section>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center gap-2">
              <h2 className="h6 mb-0">질문</h2>
              <Badge bg="secondary" pill>
                {questions.length}
              </Badge>
            </div>
            <Button type="button" size="sm" variant="outline-primary" onClick={handleAddQuestion}>
              + 질문 추가
            </Button>
          </div>

          {!hasQuestions && (
            <p className="text-muted small mb-2">
              아직 추가된 질문이 없습니다. <strong>질문 추가</strong> 버튼을 눌러 첫 번째 질문을 만들어보세요.
            </p>
          )}

          <Stack gap={3}>
            {questions.map((question, index) => {
              const isOptionType =
                question.type === 'MULTIPLE_CHOICE' ||
                question.type === 'CHECKBOXES' ||
                question.type === 'DROPDOWN'

              return (
                <Card key={question.id} className="shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">질문 {index + 1}</span>
                      <div className="d-flex align-items-center gap-2">
                        <Form.Check
                          type="switch"
                          id={`required-${question.id}`}
                          label="필수"
                          checked={question.required}
                          onChange={() => handleToggleRequired(question.id)}
                          className="small"
                        />
                        <Form.Select
                          size="sm"
                          value={question.type}
                          onChange={(e) =>
                            handleChangeQuestionType(question.id, e.target.value as QuestionType)
                          }
                        >
                          {(Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((type) => (
                            <option key={type} value={type}>
                              {QUESTION_TYPE_LABEL[type]}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    </div>

                    <Stack gap={2}>
                      <Form.Control
                        type="text"
                        value={question.title}
                        onChange={(e) => handleChangeQuestionTitle(question.id, e.target.value)}
                        placeholder="질문 제목을 입력하세요"
                      />

                      {isOptionType && (
                        <Stack gap={1}>
                          {question.options.map((opt, optIndex) => (
                            <div key={opt.id} className="d-flex align-items-center gap-2">
                              {/* 질문 타입에 따라 미리보기 아이콘 변경 */}
                              {question.type === 'MULTIPLE_CHOICE' && (
                                <Form.Check
                                  type="radio"
                                  disabled
                                  className="mb-0"
                                  aria-label="객관식 옵션 미리보기"
                                />
                              )}
                              {question.type === 'CHECKBOXES' && (
                                <Form.Check
                                  type="checkbox"
                                  disabled
                                  className="mb-0"
                                  aria-label="체크박스 옵션 미리보기"
                                />
                              )}
                              {question.type === 'DROPDOWN' && (
                                <span className="text-muted small">{optIndex + 1}.</span>
                              )}

                              <Form.Control
                                type="text"
                                value={opt.label}
                                onChange={(e) =>
                                  handleChangeOptionLabel(question.id, opt.id, e.target.value)
                                }
                                placeholder="옵션 텍스트"
                              />
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleRemoveOption(question.id, opt.id)}
                              >
                                삭제
                              </Button>
                            </div>
                          ))}
                          <div>
                            <Button
                              type="button"
                              size="sm"
                              variant="link"
                              className="px-0"
                              onClick={() => handleAddOption(question.id)}
                            >
                              + 옵션 추가
                            </Button>
                          </div>
                        </Stack>
                      )}

                      {!isOptionType && (
                        <div className="text-muted small">
                          {question.type === 'SHORT_TEXT' && (
                            <Form.Control
                              type="text"
                              disabled
                              placeholder="단답형 텍스트 응답"
                              className="mt-1"
                            />
                          )}
                          {question.type === 'LONG_TEXT' && (
                            <Form.Control
                              as="textarea"
                              rows={3}
                              disabled
                              placeholder="장문형 텍스트 응답"
                              className="mt-1"
                            />
                          )}
                          {question.type === 'DATE' && (
                            <Form.Control type="date" disabled className="mt-1" />
                          )}
                          {question.type === 'TIME' && (
                            <Form.Control type="time" disabled className="mt-1" />
                          )}
                        </div>
                      )}
                    </Stack>
                  </Card.Body>
                  <Card.Footer className="text-end bg-transparent border-0 pt-0">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      질문 삭제
                    </Button>
                  </Card.Footer>
                </Card>
              )
            })}
          </Stack>
        </section>

        {error && (
          <div className="text-danger small">
            {error}
          </div>
        )}

        <div className="mt-1">
          <Button type="submit" disabled={submitting}>
            {submitting ? '생성 중...' : '폼 생성'}
          </Button>
        </div>
      </Stack>
    </section>
  )
}