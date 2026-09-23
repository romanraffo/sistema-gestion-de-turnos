import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  loginRequest,
  registerRequest,
  type AuthUser
} from "./services/auth";

import {
  updateAppointmentRequest,
  createAppointmentRequest,
  getMyAppointmentsRequest,
  getAllAppointmentsAdminRequest,
  type BackendAppointment
} from "./services/appointments";


type View =
  | "home"
  | "login"
  | "register"
  | "dashboard"
  | "admin";


type Status =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";


type SessionUser = AuthUser;


type Appointment = {
  id: number;
  dateISO: string;
  time: string;
  status: Status;
  user: string;
  email: string;
  userId: number;
};


const statusLabel: Record<Status, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado"
};


function Badge({
  status
}: {
  status: Status;
}) {

  return (
    <span
      className={`badge ${status.toLowerCase()}`}
    >
      {statusLabel[status]}
    </span>
  );
}


function formatDate(
  dateISO: string
) {

  return new Date(
    `${dateISO}T12:00:00`
  ).toLocaleDateString(
    "es-AR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


function sortByDateTime(
  items: Appointment[]
) {

  return [...items].sort(
    (a, b) => {

      const aDate =
        new Date(
          `${a.dateISO}T${a.time}:00`
        ).getTime();


      const bDate =
        new Date(
          `${b.dateISO}T${b.time}:00`
        ).getTime();


      return aDate - bDate;
    }
  );
}


//Si por algún motivo el backend no devuelve
//los datos completos del usuario,
//mostramos un nombre auxiliar.
const sessionFallbackName = (
  userId: number
) => {

  return `Usuario ${userId}`;
};


//Transforma el formato que devuelve el backend
//al formato que ya utiliza nuestro frontend.
//
//Backend:
//dateTime: "2026-10-05T21:00:00.000Z"
//
//Frontend:
//dateISO: "2026-10-05"
//time: "18:00"
const mapBackendAppointment = (
  appointment: BackendAppointment
): Appointment => {

  const date =
    new Date(
      appointment.dateTime
    );


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  const hours =
    String(
      date.getHours()
    ).padStart(
      2,
      "0"
    );


  const minutes =
    String(
      date.getMinutes()
    ).padStart(
      2,
      "0"
    );


  return {

    id:
      appointment.id,

    dateISO:
      `${year}-${month}-${day}`,

    time:
      `${hours}:${minutes}`,

    status:
      appointment.status,

    userId:
      appointment.userId,

    user:
      appointment.user?.name ??
      sessionFallbackName(
        appointment.userId
      ),

    email:
      appointment.user?.email ??
      ""

  };
};


export default function App() {
  const [view, setView] = useState<View>("home");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => {
    const savedUser = localStorage.getItem("auth_user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as SessionUser;
    } catch {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      return null;
    }
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState("2026-10-20");
  const [time, setTime] = useState("16:00");

  useEffect(() => {

  const loadAppointments = async () => {

    if (!sessionUser) {

      setAppointments([]);

      return;
    }


    try {

      let backendAppointments;


      if (sessionUser.role === "ADMIN") {

        backendAppointments =
          await getAllAppointmentsAdminRequest();

      } else {

        backendAppointments =
          await getMyAppointmentsRequest();

      }


      const mappedAppointments =
        backendAppointments.map(
          mapBackendAppointment
        );


      setAppointments(
        mappedAppointments
      );


    } catch (error) {

      console.error(
        "Error cargando turnos:",
        error
      );

    }

  };


  loadAppointments();

}, [sessionUser]);

  const goTo = (nextView: View) => {
    if ((nextView === "dashboard" || nextView === "admin") && !sessionUser) {
      setView("login");
      return;
    }

    if (nextView === "admin" && sessionUser?.role !== "ADMIN") {
      setView("dashboard");
      return;
    }

    setView(nextView);
  };

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);

    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    setSessionUser(data.user);

    if (data.user.role === "ADMIN") {
      setView("admin");
    } else {
      setView("dashboard");
    }
  };

  const register = async (
  name: string,
  email: string,
  password: string
  ) => {
  await registerRequest(
    name,
    email,
    password
  );

  const loginData =
    await loginRequest(
      email,
      password
    );

  localStorage.setItem(
    "auth_token",
    loginData.token
  );

  localStorage.setItem(
    "auth_user",
    JSON.stringify(
      loginData.user
    )
  );

  setSessionUser(
    loginData.user
  );

  setView("dashboard");
};

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    setSessionUser(null);
    setView("home");
  };

  const userAppointments = useMemo(() => {
    if (!sessionUser || sessionUser.role !== "USER") {
      return [];
    }

    return appointments.filter(
      (appointment) => appointment.email === sessionUser.email
    );
  }, [appointments, sessionUser]);

  const activeUserAppointments = useMemo(
    () => userAppointments.filter((appointment) => appointment.status !== "CANCELLED"),
    [userAppointments]
  );

  const activeAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status !== "CANCELLED"),
    [appointments]
  );

  const nextAppointment = useMemo(() => {
    if (!sessionUser) return null;

    if (sessionUser.role === "ADMIN") {
      return sortByDateTime(activeAppointments)[0] ?? null;
    }

    return sortByDateTime(activeUserAppointments)[0] ?? null;
  }, [sessionUser, activeAppointments, activeUserAppointments]);

  const createAppointment = async () => {

  if (!sessionUser) {
    return;
  }


  try {

    const localDateTime =
      new Date(`${date}T${time}:00`);


    const dateTime =
      localDateTime.toISOString();


    await createAppointmentRequest(
      dateTime
    );


    const backendAppointments =
      sessionUser.role === "ADMIN"
        ? await getAllAppointmentsAdminRequest()
        : await getMyAppointmentsRequest();


    const mappedAppointments =
      backendAppointments.map(
        mapBackendAppointment
      );


    setAppointments(
      mappedAppointments
    );


  } catch (error) {

    if (error instanceof Error) {

      alert(
        error.message
      );

    } else {

      alert(
        "No se pudo crear el turno."
      );

    }

  }

  };

  const cancelAppointment = async (
  appointmentId: number
  ) => {

  try {

    await updateAppointmentRequest(
      appointmentId,
      {
        status: "CANCELLED"
      }
    );

    const backendAppointments =
      sessionUser?.role === "ADMIN"
        ? await getAllAppointmentsAdminRequest()
        : await getMyAppointmentsRequest();

    const mappedAppointments =
      backendAppointments.map(
        mapBackendAppointment
      );

    setAppointments(
      mappedAppointments
    );

  } catch (error) {

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert(
        "No se pudo cancelar el turno."
      );
    }

  }

  };

  const updateAppointmentAsAdmin = async (
  appointmentId: number,
  field: "dateISO" | "time" | "status",
  value: string
  ) => {

  const appointment =
    appointments.find(
      item => item.id === appointmentId
    );

  if (!appointment) {
    return;
  }


  try {

    if (field === "status") {

      await updateAppointmentRequest(
        appointmentId,
        {
          status: value as Status
        }
      );

    } else {

      const newDate =
        field === "dateISO"
          ? value
          : appointment.dateISO;

      const newTime =
        field === "time"
          ? value
          : appointment.time;


      const localDateTime =
        new Date(
          `${newDate}T${newTime}:00`
        );


      const dateTime =
        localDateTime.toISOString();


      await updateAppointmentRequest(
        appointmentId,
        {
          dateTime
        }
      );

    }


    const backendAppointments =
      await getAllAppointmentsAdminRequest();


    const mappedAppointments =
      backendAppointments.map(
        mapBackendAppointment
      );


    setAppointments(
      mappedAppointments
    );


  } catch (error) {

    if (error instanceof Error) {

      alert(
        error.message
      );

    } else {

      alert(
        "No se pudo actualizar el turno."
      );

    }

  }

  };

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => goTo("home")}>
          <span className="brandMark brandWord">ROTECH</span>
          <span className="brandTitle">Sistema de turnos</span>
        </button>

        <nav>
          <button onClick={() => goTo("home")}>Inicio</button>

          {sessionUser?.role === "USER" && (
            <button onClick={() => goTo("dashboard")}>Mis turnos</button>
          )}

          {sessionUser?.role === "ADMIN" && (
            <button onClick={() => goTo("admin")}>Administración</button>
          )}
        </nav>

        {!sessionUser ? (
          <div className="headerActions">
            <button className="ghostHeader" onClick={() => goTo("register")}>Crear cuenta</button>
            <button className="outline" onClick={() => goTo("login")}>Ingresar</button>
          </div>
        ) : (
          <div className="sessionBox">
            <div className="sessionInfo">
              <strong>{sessionUser.name}</strong>
              <small>{sessionUser.role}</small>
            </div>
            <button className="outline" onClick={logout}>Salir</button>
          </div>
        )}
      </header>

      {view === "home" && (
        <main>
          <section className={`hero ${!sessionUser ? "heroSingle" : ""}`}>
            <div>
              <span className="eyebrow">GESTIÓN SIMPLE · ACCESO SEGURO</span>
              <h1>Reservá y administrá tus turnos sin vueltas.</h1>
              <p>
                Registrate, iniciá sesión y gestioná tus turnos desde una interfaz simple.
                Las secciones privadas aparecen únicamente cuando existe una sesión válida.
              </p>

              <div className="actions">
                {!sessionUser ? (
                  <>
                    <button className="primary" onClick={() => goTo("register")}>Crear mi cuenta</button>
                    <button className="soft" onClick={() => goTo("login")}>Iniciar sesión</button>
                  </>
                ) : sessionUser.role === "ADMIN" ? (
                  <button className="primary" onClick={() => goTo("admin")}>Ir a administración</button>
                ) : (
                  <button className="primary" onClick={() => goTo("dashboard")}>Ir a mis turnos</button>
                )}
              </div>

              <div className="proof">
                <span>✓ JWT</span>
                <span>✓ Roles USER / ADMIN</span>
                <span>✓ Secciones protegidas</span>
              </div>
            </div>

            {sessionUser && (
              <NextAppointmentCard
                sessionUser={sessionUser}
                appointment={nextAppointment}
              />
            )}
          </section>

          <section className="features">
            <div>
              <span className="eyebrow">FUNCIONALIDADES</span>
              <h2>Lo necesario para un sistema de turnos real.</h2>
            </div>

            <div className="featureGrid">
              <article>
                <b>01</b>
                <h3>Acceso seguro</h3>
                <p>Registro, login y sesión autenticada.</p>
              </article>

              <article>
                <b>02</b>
                <h3>Mis turnos</h3>
                <p>La sección aparece solo para usuarios autenticados con rol USER.</p>
              </article>

              <article>
                <b>03</b>
                <h3>Administración</h3>
                <p>La gestión global solo se muestra cuando el rol es ADMIN.</p>
              </article>
            </div>
          </section>
        </main>
      )}

      {view === "login" && (
        <LoginView onLogin={login} onRegister={() => goTo("register")} />
      )}

      {view === "register" && (
        <RegisterView onRegister={register} onLogin={() => goTo("login")} />
      )}

      {view === "dashboard" && sessionUser?.role === "USER" && (
        <main className="page">
          <section className="pageHead">
            <div>
              <span className="eyebrow">MI CUENTA</span>
              <h1>Mis turnos</h1>
              <p>Administrá tus reservas desde un solo lugar.</p>
            </div>

            <div className="userChip">
              <span>{sessionUser.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <b>{sessionUser.name}</b>
                <small>{sessionUser.role}</small>
              </div>
            </div>
          </section>

          <section className="dashboardGrid">
            <div className="panel">
              <div className="panelHead">
                <div>
                  <span className="eyebrow">RESERVAS</span>
                  <h2>Mis turnos</h2>
                </div>
                <b>{userAppointments.length}</b>
              </div>

              <div className="list">
                {userAppointments.length === 0 ? (
                  <div className="emptyState">
                    <strong>No tenés reservas.</strong>
                    <span>Podés crear tu primer turno desde el panel de la derecha.</span>
                  </div>
                ) : (
                  userAppointments.map((item) => (
                    <article className="row" key={item.id}>
                      <div>
                        <small>#{item.id}</small>
                        <strong>{formatDate(item.dateISO)}</strong>
                        <span>{item.time} hs</span>
                      </div>

                      <div className="rowActions">
                        <Badge status={item.status} />

                        {item.status !== "CANCELLED" && (
                          <button className="danger" onClick={() => cancelAppointment(item.id)}>
                            Cancelar
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <aside className="panel">
              <span className="eyebrow">NUEVO TURNO</span>
              <h2>Reservar horario</h2>
              <p>El turno nuevo comienza como PENDING.</p>

              <div className="formStack">
                <label>
                  Fecha
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>

                <label>
                  Hora
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </label>

                <button className="primary full" onClick={createAppointment}>
                  Reservar turno
                </button>
              </div>
            </aside>
          </section>
        </main>
      )}

      {view === "admin" && sessionUser?.role === "ADMIN" && (
        <main className="page">
          <section className="pageHead">
            <div>
              <span className="eyebrow">ADMINISTRACIÓN</span>
              <h1>Panel de turnos</h1>
              <p>Vista global disponible exclusivamente para ADMIN.</p>
            </div>

            <span className="adminTag">ADMIN</span>
          </section>

          <section className="summary">
            <article>
              <span>Total</span>
              <strong>{appointments.length}</strong>
            </article>

            <article>
              <span>Pendientes</span>
              <strong>{appointments.filter((a) => a.status === "PENDING").length}</strong>
            </article>

            <article>
              <span>Confirmados</span>
              <strong>{appointments.filter((a) => a.status === "CONFIRMED").length}</strong>
            </article>
          </section>

          <section className="panel tablePanel">
            <span className="eyebrow">TODOS LOS TURNOS</span>
            <h2>Gestión general</h2>
            <p>
              El administrador puede cambiar fecha, hora y estado. Esto refleja el
              <code> PATCH /appointments/:id </code>que ya soporta tu backend.
            </p>

            {appointments.length === 0 ? (
              <div className="emptyState">
                <strong>No se encuentra registrado ningún turno.</strong>
                <span>Cuando un usuario reserve, aparecerá acá.</span>
              </div>
            ) : (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>

                        <td>
                          <strong>{item.user}</strong>
                          <small className="tableSub">{item.email}</small>
                        </td>

                        <td>
                          <input
                            className="tableInput"
                            type="date"
                            value={item.dateISO}
                            onChange={(e) =>
                              updateAppointmentAsAdmin(
                              item.id,
                              "dateISO",
                              e.target.value
                            )
                            }
                          />
                        </td>

                        <td>
                          <input
                            className="tableInput timeInput"
                            type="time"
                            value={item.time}
                            onChange={(e) =>
                            updateAppointmentAsAdmin(
                              item.id,
                              "time",
                              e.target.value
                            )
                          }
                          />
                        </td>

                        <td>
                          <Badge status={item.status} />
                        </td>

                        <td>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              updateAppointmentAsAdmin(
                                item.id,
                                "status",
                                e.target.value
                              )
                            }
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="adminNote">
                  En esta demo los cambios son inmediatos y locales. En la integración real,
                  fecha + hora se combinarán en <code>dateTime</code> y se enviarán al backend.
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      <footer className="siteFooter">
        <div>
          <strong>© 2026 Rotech · Sistema de turnos</strong>
          <span>Desarrollado por Román Raffo</span>
        </div>

        <div className="footerLinks">
          <a
            href="https://github.com/romanraffo/sistema-gestion-de-turnos"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <span>React + TypeScript + Vite</span>
        </div>
      </footer>
    </div>
  );
}

function NextAppointmentCard({
  sessionUser,
  appointment
}: {
  sessionUser: SessionUser;
  appointment: Appointment | null;
}) {
  const emptyMessage =
    sessionUser.role === "ADMIN"
      ? "No se encuentra registrado ningún turno."
      : "No tenés reservas.";

  return (
    <div className="heroCard">
      <div className="card">
        <div className="cardTop">
          <div>
            <small>
              {sessionUser.role === "ADMIN" ? "PRÓXIMO TURNO DEL SISTEMA" : "PRÓXIMO TURNO"}
            </small>
            <h3>{appointment ? "Consulta programada" : "Sin reservas"}</h3>
          </div>

          {appointment && <Badge status={appointment.status} />}
        </div>

        {appointment ? (
          <>
            <div className="dateRow">
              <div className="dateBox">
                <strong>
                  {new Date(`${appointment.dateISO}T12:00:00`).toLocaleDateString("es-AR", {
                    day: "2-digit"
                  })}
                </strong>
                <span>
                  {new Date(`${appointment.dateISO}T12:00:00`)
                    .toLocaleDateString("es-AR", { month: "short" })
                    .replace(".", "")
                    .toUpperCase()}
                </span>
              </div>

              <div>
                <strong>{appointment.time} hs</strong>

                <p>
                  {sessionUser.role === "ADMIN"
                    ? `${appointment.user} · Turno #${appointment.id}`
                    : `Turno #${appointment.id}`}
                </p>
              </div>
            </div>

            <div className="stats">
              <div>
                <strong>{appointment.status === "CANCELLED" ? "0" : "1"}</strong>
                <span>Próximo</span>
              </div>

              <div>
                <strong>{appointment.status === "CONFIRMED" ? "1" : "0"}</strong>
                <span>Confirmado</span>
              </div>

              <div>
                <strong>{appointment.status === "PENDING" ? "1" : "0"}</strong>
                <span>Pendiente</span>
              </div>
            </div>
          </>
        ) : (
          <div className="emptyHero">
            <div className="emptyHeroIcon">—</div>
            <strong>{emptyMessage}</strong>
            <span>
              {sessionUser.role === "ADMIN"
                ? "Los próximos turnos aparecerán automáticamente cuando existan reservas."
                : "Reservá un turno desde la sección Mis turnos."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginView({
  onLogin,
  onRegister
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: () => void;
}) {
  const [email, setEmail] = useState("roman@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("No se pudo iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authLayout">
      <section className="authCard">
        <span className="eyebrow">BIENVENIDO</span>
        <h1>Ingresá a tu cuenta</h1>
        <p>Ingresá con un usuario registrado en el sistema.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <div className="loginError">
              {error}
            </div>
          )}

          <button className="primary full" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="foot">
          ¿No tenés cuenta? <button onClick={onRegister}>Registrarme</button>
        </p>
      </section>

      <aside className="sidePanel">
        <span className="eyebrow">SESIÓN REAL</span>
        <h2>El rol ahora lo decide tu backend.</h2>
        <p>
          El frontend recibe el usuario y el JWT desde <code>POST /auth/login</code>.
          Ya no existe la simulación de ADMIN por email.
        </p>
      </aside>
    </main>
  );
}

function RegisterView({
  onRegister,
  onLogin
}: {
  onRegister: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  onLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="authLayout">
      <section className="authCard">
        <span className="eyebrow">CREAR CUENTA</span>
        <h1>Registrate</h1>
        <p>Los usuarios nuevos se crean con rol USER y, al principio, sin reservas.</p>

        <form
  onSubmit={async (e) => {
    e.preventDefault();

    await onRegister(
      name,
      email,
      password
    );
  }}
>
  <label>
    Nombre

    <input
      value={name}
      onChange={(e) =>
        setName(e.target.value)
      }
      required
    />
  </label>


  <label>
    Email

    <input
      type="email"
      value={email}
      onChange={(e) =>
        setEmail(e.target.value)
      }
      required
    />
  </label>


  <label>
    Contraseña

    <input
      type="password"
      value={password}
      onChange={(e) =>
        setPassword(e.target.value)
      }
      minLength={6}
      required
    />
  </label>


  <button
    className="primary full"
    type="submit"
  >
    Crear cuenta
  </button>
</form>

        <p className="foot">
          ¿Ya tenés cuenta? <button onClick={onLogin}>Ingresar</button>
        </p>
      </section>

      <aside className="sidePanel">
        <span className="eyebrow">REGISTRO SEGURO</span>
        <h2>El usuario no puede elegir ser ADMIN.</h2>
        <p>En la integración real el backend seguirá asignando USER por defecto.</p>
      </aside>
    </main>
  );
}
