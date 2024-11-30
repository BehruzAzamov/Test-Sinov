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
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editContract, setEditContract] = useState<Contract | null>(null);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        notification.error({
          message: "Authentication Error",
          description: "No token found. Please log in again.",
        });
        navigate("/login");
        return;
      }

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
  }, [navigate]);

  useEffect(() => {
    const fetchContracts = async () => {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        notification.error({
          message: "Authentication Error",
          description: "No token found. Please log in again.",
        });
        navigate("/login");
        return;
      }

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
        addForm.resetFields();
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

  const handleEditContract = (contract: Contract) => {
    setEditContract(contract);
    console.log("Selected contract for edit:", contract); // Log the selected contract
    editForm.setFieldsValue({
      title: contract.title,
      courseId: contract.course.id,
    });
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async (values: { title: string; courseId: number }) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      notification.error({
        message: "Authentication Error",
        description: "No token found. Please log in again.",
      });
      return;
    }
    console.log(`URL: https://dev.api-erp.najotedu.uz/api/staff/contracts/${editContract?.id}`);

    try {
      const response = await fetch(
        `https://dev.api-erp.najotedu.uz/api/staff/contracts/${editContract?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(values),
        }
      );

      const result = await response.json();

      if (response.ok) {
        notification.success({
          message: "Success",
          description: "Contract updated successfully!",
        });
        setData((prevData) =>
          prevData.map((contract) =>
            contract.id === editContract?.id
              ? { ...contract, title: values.title, course: { ...contract.course, id: values.courseId } }
              : contract
          )
        );
        setIsEditModalVisible(false);
        setEditContract(null);
      } else {
        notification.error({
          message: "Error",
          description: result.error?.errMsg || "Failed to update contract.",
        });
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while updating the contract.",
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

  useEffect(() => {
    if (editContract) {
      console.log("Updated editContract:", editContract); // Log whenever editContract changes
    }
  }, [editContract]);

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
        }}
      >
        <Input
          placeholder="Search..."
          value={searchText}
          onChange={handleSearch}
          prefix={<SearchOutlined />}
        />
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Contract
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalItems,
            onChange: handlePageChange,
          }}
          rowKey="id"
        />
      </Spin>

      {/* Add Contract Modal */}
      <Modal
        title="Add Contract"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={addForm} onFinish={handleAddContract}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="courseId"
            label="Course"
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select>
              {courses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Contract Modal */}
      <Modal
        title="Edit Contract"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} onFinish={handleSaveEdit}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="courseId"
            label="Course"
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select>
              {courses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Home;
