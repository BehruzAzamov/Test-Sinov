import { Image, Input, Form, Button, notification } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "https://dev.api-erp.najotedu.uz/api/staff/auth/sign-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const staffName = `${data.data.staffInfo.firstName} ${data.data.staffInfo.lastName}`;

        notification.success({
          message: "Kirish muvaffaqiyatli",
          description: `Xush kelibsiz, ${staffName}!`,
        });

        localStorage.setItem("authToken", data.data.accessToken);
        navigate("/");
      } else {
        notification.error({
          message: "Kirishda xatolik",
          description: data.error?.errMsg || "Noto'g'ri ma'lumotlar, iltimos qayta urinib ko'ring.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Xatolik",
        description: "Biror xato yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        height: "100vh",
        gap: "80px",
        overflow: "hidden",
      }}
    >
      <Image
        width="100%"
        height="auto"
        style={{ maxWidth: "600px", objectFit: "contain" }}
        src="./najottalim.svg"
        preview={false}
      />
      <div>
        <img
          style={{ position: "absolute", top: 60 }}
          src="./logo.svg"
          alt="Najot Ta'lim logo"
        />
        <h1 style={{ color: "black" }}>Tizimga kirish</h1>
        <Form
          onFinish={handleSubmit}
          layout={"vertical"}
          form={form}
          initialValues={{
            layout: "vertical",
          }}
          style={{
            maxWidth: 600,
            marginTop: "20px",
          }}
        >
          <Form.Item
            label="Login"
            style={{ fontWeight: "bold" }}
            name="login"
            rules={[
              {
                required: true,
                message: "Loginni kiriting",
              },
            ]}
          >
            <Input
              value={username}
              style={{
                width: 380,
                height: 45,
              }}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Loginni kiriting"
            />
          </Form.Item>
          <Form.Item
            label="Parol"
            style={{ fontWeight: "bold" }}
            name="password"
            rules={[
              {
                required: true,
                message: "Parolni kiriting",
              },
            ]}
          >
            <Input.Password
              value={password}
              style={{
                width: 380,
                height: 45,
              }}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolni kiriting"
            />
          </Form.Item>
          <Form.Item>
            <Button
              loading={loading}
              style={{
                width: "100%",
                height: 45,
                background: "#0EB182",
              }}
              type="primary"
              htmlType="submit"
            >
              Kirish
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
