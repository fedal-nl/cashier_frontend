import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap"

import {
  createCustomer,
  listCustomers,
  updateCustomer,
  type Customer,
  type CustomerPayload,
} from "../services/customers"

const emptyForm: CustomerPayload = {
  name: "",
  email: "",
  phone_number: "",
  address: "",
}

const PAGE_SIZE_OPTIONS = [
  10,
  25,
  50,
]

export default function Customers() {
  const [customers, setCustomers] =
    useState<Customer[]>([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [currentPage, setCurrentPage] =
    useState(1)

  const [pageSize, setPageSize] =
    useState(10)

  const [
    totalCustomers,
    setTotalCustomers,
  ] = useState(0)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [showModal, setShowModal] =
    useState(false)

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null)

  const [form, setForm] =
    useState<CustomerPayload>(emptyForm)

  const filteredCustomers = useMemo(() => {
    const term =
      search.trim().toLowerCase()

    if (!term) {
      return customers
    }

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone_number,
        customer.address,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(term)
        )
    )
  }, [customers, search])

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data =
        await listCustomers({
          page: currentPage,
          pageSize,
        })
      setCustomers(data.results)
      setTotalCustomers(data.count)
    } catch (err) {
      console.error(err)
      setError("تعذر تحميل العملاء")
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize])

  useEffect(() => {
    let isActive = true

    listCustomers({
      page: currentPage,
      pageSize,
    })
      .then((data) => {
        if (isActive) {
          setCustomers(data.results)
          setTotalCustomers(data.count)
        }
      })
      .catch((err) => {
        console.error(err)
        if (isActive) {
          setError(
            "تعذر تحميل العملاء"
          )
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [currentPage, pageSize])

  function openCreateModal() {
    setEditingCustomer(null)
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
  }

  function openEditModal(
    customer: Customer
  ) {
    setEditingCustomer(customer)
    setForm({
      name: customer.name,
      email: customer.email ?? "",
      phone_number:
        customer.phone_number ?? "",
      address: customer.address ?? "",
    })
    setError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingCustomer(null)
    setForm(emptyForm)
  }

  function updateForm(
    field: keyof CustomerPayload,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (editingCustomer) {
        await updateCustomer(
          editingCustomer.id,
          form
        )
      } else {
        await createCustomer(form)
      }

      closeModal()
      await loadCustomers()
    } catch (err) {
      console.error(err)
      setError(
        editingCustomer
          ? "تعذر تحديث بيانات العميل"
          : "تعذر إنشاء العميل"
      )
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCustomers / pageSize
    )
  )

  const firstCustomerNumber =
    totalCustomers === 0
      ? 0
      : (currentPage - 1) * pageSize + 1

  const lastCustomerNumber = Math.min(
    currentPage * pageSize,
    totalCustomers
  )

  const paginationItems =
    useMemo(() => {
      const items: number[] = []
      const start = Math.max(
        1,
        currentPage - 2
      )
      const end = Math.min(
        totalPages,
        currentPage + 2
      )

      for (
        let page = start;
        page <= end;
        page += 1
      ) {
        items.push(page)
      }

      return items
    }, [currentPage, totalPages])

  function handlePageSizeChange(
    value: string
  ) {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  return (
    <Container
      fluid
      className="customers-page py-4 px-3 px-lg-4"
      dir="rtl"
    >
      <div className="customers-header">
        <div>
          <h2>العملاء</h2>
          <p>
            إدارة بيانات العملاء للطلبات
            والتواصل
          </p>
        </div>

        <Button onClick={openCreateModal}>
          عميل جديد
        </Button>
      </div>

      <Row className="g-3 align-items-center mb-3">
        <Col lg={7}>
          <InputGroup>
            <Form.Control
              placeholder="بحث بالاسم أو رقم الهاتف أو البريد أو العنوان"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearch("")}
              disabled={!search}
            >
              مسح
            </Button>
          </InputGroup>
        </Col>

        <Col lg={2}>
          <Form.Select
            value={pageSize}
            onChange={(event) =>
              handlePageSizeChange(
                event.target.value
              )
            }
          >
            {PAGE_SIZE_OPTIONS.map(
              (size) => (
                <option
                  key={size}
                  value={size}
                >
                  {size} عميل
                </option>
              )
            )}
          </Form.Select>
        </Col>

        <Col
          lg={3}
          className="customers-count"
        >
          {totalCustomers} عميل
        </Col>
      </Row>

      {error && (
        <Alert
          variant="danger"
          className="text-end"
        >
          {error}
        </Alert>
      )}

      <div className="customers-table-wrap">
        {loading ? (
          <div className="customers-empty">
            <Spinner animation="border" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="customers-empty">
            لا توجد نتائج
          </div>
        ) : (
          <Table
            hover
            responsive
            className="customers-table align-middle mb-0"
          >
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>البريد</th>
                <th>العنوان</th>
                <th className="text-start">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(
                (customer) => (
                  <tr key={customer.id}>
                    <td className="customer-name">
                      {customer.name}
                    </td>
                    <td>
                      {customer.phone_number ||
                        "-"}
                    </td>
                    <td>
                      {customer.email || "-"}
                    </td>
                    <td>
                      {customer.address || "-"}
                    </td>
                    <td className="text-start">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          openEditModal(
                            customer
                          )
                        }
                      >
                        تعديل
                      </Button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        )}
      </div>

      {!loading && (
        <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center mt-3">
          <div className="text-muted small">
            عرض {firstCustomerNumber} إلى{" "}
            {lastCustomerNumber} من{" "}
            {totalCustomers} عميل
          </div>

          <Pagination className="mb-0">
            <Pagination.First
              onClick={() =>
                setCurrentPage(1)
              }
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              disabled={currentPage === 1}
            />

            {paginationItems[0] > 1 && (
              <Pagination.Ellipsis disabled />
            )}

            {paginationItems.map((page) => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() =>
                  setCurrentPage(page)
                }
              >
                {page}
              </Pagination.Item>
            ))}

            {paginationItems[
              paginationItems.length - 1
            ] < totalPages && (
              <Pagination.Ellipsis disabled />
            )}

            <Pagination.Next
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
                )
              }
              disabled={
                currentPage === totalPages
              }
            />
            <Pagination.Last
              onClick={() =>
                setCurrentPage(totalPages)
              }
              disabled={
                currentPage === totalPages
              }
            />
          </Pagination>
        </div>
      )}

      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        dir="rtl"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCustomer
                ? "تعديل العميل"
                : "عميل جديد"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                الاسم
              </Form.Label>
              <Form.Control
                required
                value={form.name}
                onChange={(event) =>
                  updateForm(
                    "name",
                    event.target.value
                  )
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                رقم الهاتف
              </Form.Label>
              <Form.Control
                value={
                  form.phone_number
                }
                onChange={(event) =>
                  updateForm(
                    "phone_number",
                    event.target.value
                  )
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                البريد الإلكتروني
              </Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateForm(
                    "email",
                    event.target.value
                  )
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>
                العنوان
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.address}
                onChange={(event) =>
                  updateForm(
                    "address",
                    event.target.value
                  )
                }
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={closeModal}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "جار الحفظ"
                : "حفظ"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}
