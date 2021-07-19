import { Request, Response, NextFunction } from "express";
import HttpError from "../../models/httpError";
import { IBookingService } from "../../services/booking";

class BookingController {
  private bookingService: IBookingService;

  constructor(bookingService: IBookingService) {
    this.bookingService = bookingService;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError("You are not authorized", 403));
    }

    const dateStart = new Date(req.body.dateStart);
    const dateEnd = new Date(req.body.dateEnd);
    const note = req.body.note;

    try {
      const newAppointment = await this.bookingService.create(
        req.user.id,
        dateStart,
        dateEnd,
        note
      );
      res.json({ newAppointment });
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const appointmentId = req.body.id;

    try {
      await this.bookingService.delete(appointmentId);

      res.status(200).json();
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };

  getByRange = async (req: Request, res: Response, next: NextFunction) => {
    const dateStart = new Date(req.query.dateStart as string);
    const dateEnd = new Date(req.query.dateEnd as string);

    try {
      const appointments = await this.bookingService.getByRange(
        dateStart,
        dateEnd
      );
      res.json({ appointments });
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    const appointmentId = req.body.id;

    try {
      const appointment = await this.bookingService.getById(appointmentId);
      if (
        req.user &&
        req.user.role.includes("USER") &&
        req.user.id !== appointment.customer
      ) {
        return next(
          new HttpError(
            "You are not allowed to edit other user's appointment",
            403
          )
        );
      }
      res.json({ appointment });
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError("You are not authorized", 403));
    }

    const dateStart = new Date(req.body.dateStart);
    const dateEnd = new Date(req.body.dateEnd);
    const { id, note } = req.body;

    try {
      const oldAppointment = await this.bookingService.getById(id);
      if (
        req.user &&
        req.user.role.includes("USER") &&
        req.user.id !== oldAppointment.customer
      ) {
        return next(
          new HttpError(
            "You are not allowed to edit other user's appointment",
            403
          )
        );
      }

      const newAppointment = await this.bookingService.update(
        dateStart,
        dateEnd,
        id,
        note
      );
      res.json({ oldAppointment, newAppointment });
    } catch (err) {
      return next(new HttpError(err, 500));
    }
  };
}

export default BookingController;
