import { useState } from "react"
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [error, setError] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      await login(
        username,
        password
      )

      navigate("/")
    } catch {
      setError(
        "اسم المستخدم أو كلمة المرور غير صحيحة"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Card
        className="shadow"
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <Card.Body>
          <h2 className="text-center mb-4">
            تسجيل الدخول
          </h2>

          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                اسم المستخدم
              </Form.Label>

              <Form.Control
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                كلمة المرور
              </Form.Label>

              <Form.Control
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading
                ? "جاري الدخول..."
                : "دخول"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
