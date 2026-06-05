import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "muthanna_super_secret_key_2026";

const DATA_FILE = path.join(process.cwd(), "data_store.json");

// Structure of our persistent database
interface AppData {
  users: any[];
  messages: any[];
  directives: any[];
  externalBodies: any[];
}

// Baseline Initial Datasets
const DEFAULT_DATA: AppData = {
  users: [
    {
      id: "admin_1",
      username: "admin",
      name: "الآدمن (مسؤول النظام)",
      role: "admin",
      passwordText: "admin123",
      divisionId: "all",
      createdAt: "2026-05-26T12:00:00Z"
    },
    {
      id: "director_1",
      username: "safaa",
      name: "م.م صفاء هادي عبد العالي الطاني (مدير القسم)",
      role: "manager",
      passwordText: "director123",
      divisionId: "all",
      createdAt: "2026-05-26T12:05:00Z"
    },
    {
      id: "user_1780079261395",
      username: "emp_dany817",
      name: "م.م حسين فالح",
      role: "head",
      passwordText: "Bf4RCa6X",
      divisionId: "training",
      createdAt: "2026-05-29T18:27:41.395Z"
    },
    {
      id: "user_1780079309782",
      username: "emp_hoik702",
      name: "م.م احمد هاشم",
      role: "employee",
      passwordText: "PFcxPna5",
      divisionId: "training",
      createdAt: "2026-05-29T18:28:29.782Z"
    },
    {
      id: "user_1780079348677",
      username: "emp_uhuu446",
      name: "م.م علي صباح",
      role: "head",
      passwordText: "SR9pJfe2",
      divisionId: "research",
      createdAt: "2026-05-29T18:29:08.677Z"
    },
    {
      id: "user_1780079418666",
      username: "emp_bjel848",
      name: "م.م طاهر طالب",
      role: "employee",
      passwordText: "jWRbKhAy",
      divisionId: "research",
      createdAt: "2026-05-29T18:30:18.666Z"
    },
    {
      id: "user_1780079499688",
      username: "emp_fyqk451",
      name: "سميرة محمد",
      role: "head",
      passwordText: "YPpFAfp3",
      divisionId: "institutes",
      createdAt: "2026-05-29T18:31:39.688Z"
    },
    {
      id: "user_1780079531229",
      username: "emp_xtye223",
      name: "ضرغام ماجد",
      role: "employee",
      passwordText: "RnRue4Hj",
      divisionId: "institutes",
      createdAt: "2026-05-29T18:32:11.229Z"
    },
    {
      id: "user_1780079566803",
      username: "emp_pndh559",
      name: "ستار عبد اكعيم",
      role: "head",
      passwordText: "GQKdMRDs",
      divisionId: "handicrafts",
      createdAt: "2026-05-29T18:32:46.803Z"
    },
    {
      id: "user_1780079667728",
      username: "emp_cuiv696",
      name: "م.علي ناجح",
      role: "head",
      passwordText: "jbahYdvv",
      divisionId: "boys_fine_arts",
      createdAt: "2026-05-29T18:34:27.728Z"
    },
    {
      id: "user_1780079871604",
      username: "emp_uwhh381",
      name: "هديل شاكر",
      role: "employee",
      passwordText: "7nMN4wZi",
      divisionId: "girls_fine_arts",
      createdAt: "2026-05-29T18:37:51.604Z"
    }
  ],
  messages: [
    {
      id: "msg_1",
      senderId: "director_1",
      senderName: "م.م صفاء هادي عبد العالي الطاني (مدير القسم)",
      senderRole: "manager",
      content: "السلام عليكم ورحمة الله وبركاته. الزملاء الأعزاء مسؤولي الشعب والمعاهد والوحدات والموظفين، نرحب بكم في نظام الاتصالات الداخلي ونقل البريد الإلكتروني لقسمنا. يرجى توثيق كافة المراسلات الرسمية والبريد الداخلي هنا.",
      timestamp: "2026-05-26T20:30:00Z",
      type: "general",
      divisionId: "all"
    },
    {
      id: "msg_2",
      senderId: "head_training",
      senderName: "علي حسين الكناني (مسؤول شعبة التدريب)",
      senderRole: "head",
      content: "وعليكم السلام ورحمة الله وبركاته أستاذنا الفاضل. تم استلام التوجيه، وسنقوم برفع خطة التدريب للفصل القادم عبر هذا النظام الإلكتروني بعد قليل.",
      timestamp: "2026-05-26T20:45:00Z",
      type: "general",
      divisionId: "all"
    },
    {
      id: "msg_3",
      senderId: "director_1",
      senderName: "م.م صفاء هادي عبد العالي الطاني (مدير القسم)",
      senderRole: "manager",
      content: "يرجى مراجعة وتدقيق معاملات القبول الجديدة وإرسال التوجيهات النهائية للمعاهد بشكل عاجل.",
      timestamp: "2026-05-26T20:50:00Z",
      type: "division",
      divisionId: "institutes"
    },
    {
      id: "msg_4",
      senderId: "head_institutes",
      senderName: "سعد الجابري (مسؤول شعبة المعاهد)",
      senderRole: "head",
      content: "أهلاً بك حضرة المدير. تم استلام الملف المرفق بخصوص القبولات، وجاري التدقيق والعمل عليه لإرسال التقرير النهائي اليوم.",
      timestamp: "2026-05-26T20:55:00Z",
      type: "division",
      divisionId: "institutes"
    }
  ],
  directives: [
    {
      id: "dir_1",
      title: "تبسيط الإجراءات",
      content: "التوجيه بتبسيط الإجراءات الإدارية وتكثيف استخدام البرنامج الرقمي للبريد الإلكتروني الداخلي لسرعة إنجاز معاملات الكوادر التعليمية والتدريبية.",
      source: "general_director",
      timestamp: "2026-05-26T14:30:00Z"
    },
    {
      id: "dir_2",
      title: "الانضباط الإداري الرسمي",
      content: "التأكيد على كافة مسؤولي الشعب والمعاهد والوحدات والموظفين بالالتزام بالصلاحيات المحددة، وحفظ وتوثيق المراسلات الإدارية الرسمية بكل سرية ودقة.",
      source: "general_director",
      timestamp: "2026-05-26T15:20:00Z"
    },
    {
      id: "dir_3",
      title: "مراقبة وتقييم الأداء",
      content: "يوجه قسم الاعداد والتدريب كافة الكوادر بمتابعة العمل اليومي وتحديث بيانات البريد بشكل دوري تفادياً لأي تأخير في إرسال المخاطبات الرسمية.",
      source: "department_director",
      timestamp: "2026-05-26T16:00:00Z"
    }
  ],
  externalBodies: [
    { id: "office_dg", name: "مكتب المدير العام" },
    { id: "hr_dept", name: "قسم الموارد البشرية" },
    { id: "edu_supervision_dept", name: "قسم الاشراف التربوي" },
    { id: "special_supervision_dept", name: "قسم الاشراف الاختصاصي" },
    { id: "technical_dept", name: "قسم الشؤون الفنية" },
    { id: "audit_dept", name: "قسم التدقيق" },
    { id: "finance_dept", name: "قسم الحسابات" },
    { id: "sports_activity_dept", name: "قسم النشاط الرياضي" },
    { id: "school_activity_dept", name: "قسم النشاط المدرسي" }
  ]
};

// Guard reads and writes safely
function loadData(): AppData {
  let data: AppData = DEFAULT_DATA;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      data = JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading database store, falling back to defaults:", error);
  }

  // Migration: Hash plaintext passwords
  let migrated = false;
  data.users = data.users.map(user => {
    if (user.passwordText) {
      user.passwordHash = bcrypt.hashSync(user.passwordText, 10);
      delete user.passwordText;
      migrated = true;
    }
    return user;
  });

  if (migrated) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Migration save failed:", e);
    }
  }

  return data;
}

function saveData(data: AppData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database file to disk:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Let the server support large JSON requests (for images / attachments base64)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS Middleware for Netlify or local dev endpoints
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // --- API ROUTING SECTION ---

  // AUTHENTICATION
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const data = loadData();
    const user = data.users.find(u => u.username.toLowerCase() === username?.trim().toLowerCase());
    
    if (!user) {
      res.status(401).json({ error: "اسم المستخدم هذا غير مسجل في النظام." });
      return;
    }
    
    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى." });
      return;
    }
    
    const token = jwt.sign({ id: user.id, role: user.role, divisionId: user.divisionId }, JWT_SECRET, { expiresIn: '24h' });
    
    // Return user without passwordHash
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  });

  // JWT Middleware
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: "غير مصرح لك بالوصول (Missing Token)" });
      return;
    }
    
    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
      if (err) {
        res.status(403).json({ error: "الجلسة منتهية، يرجى تسجيل الدخول مجدداً." });
        return;
      }
      (req as any).user = decodedUser;
      next();
    });
  };

  // Protect all API routes except /login
  app.use("/api", (req, res, next) => {
    if (req.path === "/login") {
      return next();
    }
    authenticateToken(req, res, next);
  });

  // USERS
  app.get("/api/users", (req, res) => {
    const data = loadData();
    // Don't send password hashes to the client
    const safeUsers = data.users.map(({ passwordHash, ...u }) => u);
    res.json(safeUsers);
  });

  app.post("/api/users", (req, res) => {
    const data = loadData();
    const newUser = req.body;
    
    // Hash password if provided
    if (newUser.passwordText) {
      newUser.passwordHash = bcrypt.hashSync(newUser.passwordText, 10);
      delete newUser.passwordText;
    } else if (newUser.password) {
      newUser.passwordHash = bcrypt.hashSync(newUser.password, 10);
      delete newUser.password;
    }
    
    data.users.push(newUser);
    saveData(data);
    
    const { passwordHash, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  });

  app.delete("/api/users/:id", (req, res) => {
    const data = loadData();
    data.users = data.users.filter((u) => u.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // MESSAGES
  app.get("/api/messages", (req, res) => {
    const data = loadData();
    res.json(data.messages);
  });

  app.post("/api/messages", (req, res) => {
    const data = loadData();
    const newMessage = req.body;
    data.messages.push(newMessage);
    saveData(data);
    res.status(201).json(newMessage);
  });

  app.delete("/api/messages/clear", (req, res) => {
    const data = loadData();
    data.messages = [];
    saveData(data);
    res.json({ success: true });
  });

  app.delete("/api/messages/:id", (req, res) => {
    const data = loadData();
    data.messages = data.messages.filter((m) => m.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  app.post("/api/messages/clear-attachments", (req, res) => {
    const data = loadData();
    data.messages = data.messages.map((m) => ({ ...m, attachments: [] }));
    saveData(data);
    res.json({ success: true });
  });

  // DIRECTIVES
  app.get("/api/directives", (req, res) => {
    const data = loadData();
    res.json(data.directives);
  });

  app.post("/api/directives", (req, res) => {
    const data = loadData();
    const newDir = req.body;
    data.directives.unshift(newDir); // Insert at beginning of archive lists
    saveData(data);
    res.status(201).json(newDir);
  });

  app.put("/api/directives/:id", (req, res) => {
    const data = loadData();
    const { title, content } = req.body;
    data.directives = data.directives.map((d) => 
      d.id === req.params.id ? { ...d, title, content } : d
    );
    saveData(data);
    res.json({ success: true });
  });

  app.delete("/api/directives/:id", (req, res) => {
    const data = loadData();
    data.directives = data.directives.filter((d) => d.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // EXTERNAL BODIES
  app.get("/api/external-bodies", (req, res) => {
    const data = loadData();
    res.json(data.externalBodies);
  });

  app.post("/api/external-bodies", (req, res) => {
    const data = loadData();
    const newBody = req.body;
    data.externalBodies.push(newBody);
    saveData(data);
    res.status(201).json(newBody);
  });

  app.put("/api/external-bodies/:id", (req, res) => {
    const data = loadData();
    const { name } = req.body;
    data.externalBodies = data.externalBodies.map((b) =>
      b.id === req.params.id ? { ...b, name } : b
    );
    saveData(data);
    res.json({ success: true });
  });

  app.delete("/api/external-bodies/:id", (req, res) => {
    const data = loadData();
    data.externalBodies = data.externalBodies.filter((b) => b.id !== req.params.id);
    saveData(data);
    res.json({ success: true });
  });

  // Serve static assets in production or use Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite's dev middlewares
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from compiled dist folder
    app.use(express.static(distPath));
    
    // SPA routing fallback to index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup error:", err);
  process.exit(1);
});
