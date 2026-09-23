import { apiRequest } from "./api";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";


export type BackendAppointment = {
  id: number;
  dateTime: string;
  status: AppointmentStatus;
  userId: number;

  user?: {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
  };
};


export const getMyAppointmentsRequest = async (): Promise<BackendAppointment[]> => {

  const response = await apiRequest("/appointments");


  const data = await response.json();


  if (!response.ok) {
    throw new Error(
      data.message || "No se pudieron obtener los turnos."
    );
  }


  return data;
};


export const getAllAppointmentsAdminRequest =
  async (): Promise<BackendAppointment[]> => {

    const response = await apiRequest(
      "/appointments/admin/all"
    );


    const data = await response.json();


    if (!response.ok) {
      throw new Error(
        data.message || "No se pudieron obtener los turnos."
      );
    }


    return data;
  };

export const createAppointmentRequest = async (
  dateTime: string
): Promise<BackendAppointment> => {

  const response = await apiRequest("/appointments", {
    method: "POST",

    body: JSON.stringify({
      dateTime
    })
  });


  const data = await response.json();


  if (!response.ok) {
    throw new Error(
      data.message || "No se pudo crear el turno."
    );
  }


  return data;
};

export const updateAppointmentRequest = async (
  id: number,
  data: {
    dateTime?: string;
    status?: AppointmentStatus;
  }
): Promise<BackendAppointment> => {

  const response = await apiRequest(
    `/appointments/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data)
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.message ||
      "No se pudo actualizar el turno."
    );
  }

  return responseData;
};