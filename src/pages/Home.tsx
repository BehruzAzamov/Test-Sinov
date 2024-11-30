import { useState, useEffect } from "react";
import {
  Table,
  Button,
  notification,
  Spin,
  Input,
  Modal,
  Form,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined, MoreOutlined } from "@ant-design/icons";

interface Contract {
  id: number;
  title: string;
  course: { id: number; name: string };
}

function Home() {
  const [data, setData] = useState<Contract[]>([]);
  const [filteredData, setFilteredData] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editContract, setEditContract] = useState<Contract | null>(null);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleEditContract = (contract: Contract) => {
    setEditContract(contract);
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      notification.error({
        message: "Authentication Error",
        description: "No token found. Please log in again.",
      });
      navigate("/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "https://dev.api-erp.najotedu.uz/api/staff/courses",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.data) {
          setCourses(result.data.courses || []);
        } else {
          notification.error({
            message: "Error",
            description: result.error?.errMsg || "Failed to fetch courses.",
          });
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        notification.error({
          message: "Error",
          description: "An error occurred while fetching courses.",
        });
      }
    };

    fetchCourses();

    const fetchContracts = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `https://dev.api-erp.najotedu.uz/api/staff/contracts/all?page=${currentPage}&perPage=${pageSize}&search=${searchText}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.data) {
          setData(result.data.contracts || []);
          setTotalItems(result.data.totalItems || 0);
        } else {
          notification.error({
            message: "Error",
            description: result.error?.errMsg || "Failed to fetch contracts.",
          });
        }
      } catch (error) {
        console.error("Error fetching contracts:", error);
        notification.error({
          message: "Error",
          description: "An error occurred while fetching contracts.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [currentPage, pageSize, searchText, navigate]);

  useEffect(() => {
    const filtered = data.filter((contract) =>
      contract.title.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
    setTotalItems(filtered.length);
  }, [data, searchText]);

  const handleAddContract = async (values: {
    title: string;
    courseId: number;
  }) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      notification.error({
        message: "Authentication Error",
        description: "No token found. Please log in again.",
      });
      return;
    }

    try {
      const response = await fetch(
        `https://dev.api-erp.najotedu.uz/api/staff/contracts/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            title: values.title,
            courseId: values.courseId,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        notification.success({
          message: "Success",
          description: "Contract created successfully!",
        });
        setIsModalVisible(false);
        form.resetFields();
        setData((prevData) => [
          ...prevData,
          {
            id: result.data.id,
            title: values.title,
            course: { id: values.courseId, name: "" },
          },
        ]);
      } else {
        notification.error({
          message: "Error",
          description: result.error?.errMsg || "Failed to create contract.",
        });
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while creating the contract.",
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.trim().toLowerCase());
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Nomi",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Kurs",
      dataIndex: "course",
      key: "course",
      render: (course: { name: string }, record: Contract) => (
        <div>
          <span>{course?.name || "No course"}</span>
          <MoreOutlined
            style={{ marginLeft: "10px", cursor: "pointer" }}
            onClick={() => handleEditContract(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        <Input
          placeholder="Qidiruv"
          prefix={<SearchOutlined />}
          onChange={handleSearch}
          style={{
            width: "100%",
            height: "45px",
            borderTopRightRadius: "8px",
            borderTopLeftRadius: "8px",
            borderColor: "#007BFF",
          }}
        />
        <Button
          style={{
            color: "#fff",
            borderRadius: "8px",
            marginLeft: "10px",
            background: "#0EB182",
            width: "103px",
            height: "45px",
          }}
          onClick={() => setIsModalVisible(true)}
        >
          Qo'shish
        </Button>
      </div>

      {loading ? (
        <Spin size="large" style={{ margin: "auto", display: "block" }} />
      ) : (
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Table
            dataSource={filteredData.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            columns={columns}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize,
              total: totalItems,
              onChange: handlePageChange,
              pageSizeOptions: ["10", "20", "50", "100"],
              showSizeChanger: true,
              showTotal: (total) =>
                `Total ${total} items | Page ${currentPage} of ${Math.ceil(
                  totalItems / pageSize
                )}`,
            }}
            style={{ width: "100%", height: "90%" }}
            scroll={{
              y: 500,
            }}
          />
        </div>
      )}

      <Modal
        title="Kontrakt qo'shish"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddContract}
          layout="vertical"
          initialValues={{
            title: "",
            courseId: courses[0]?.id || 0,
          }}
        >
          <Form.Item
            label="Nomi"
            name="title"
            rules={[{ required: true, message: "Kontrakt nomini kiriting" }]}
          >
            <Input placeholder="Kontrakt nomi" />
          </Form.Item>

          <Form.Item
            label="Kurs"
            name="courseId"
            rules={[{ required: true, message: "Kursni tanlang" }]}
          >
            <Select
              placeholder="Kursni tanlang"
              options={courses.map((course) => ({
                value: course.id,
                label: course.name,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Button
              style={{ width: "100%" }}
              type="primary"
              htmlType="submit"
            >
              Qo'shish
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tahrirlash"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => form.submit()}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddContract}
          layout="vertical"
          initialValues={{
            title: editContract?.title,
            courseId: editContract?.course?.id || courses[0]?.id || 0,
          }}
        >
          <Form.Item
            label="Nomi"
            name="title"
            rules={[{ required: true, message: "Kontrakt nomini kiriting" }]}
          >
            <Input placeholder="Kontrakt nomi" />
          </Form.Item>

          <Form.Item
            label="Kurs"
            name="courseId"
            rules={[{ required: true, message: "Kursni tanlang" }]}
          >
            <Select
              placeholder="Kursni tanlang"
              options={courses.map((course) => ({
                value: course.id,
                label: course.name,
              }))}
            />
          </Form.Item>

          <Form.Item>
            <Button
              style={{ width: "100%" }}
              type="primary"
              htmlType="submit"
            >
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Home;
