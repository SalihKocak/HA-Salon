namespace GymManagement.Application.DTOs.Admin;

public class AdminUpdateMemberMeasurementsRequest
{
    public double? MeasurementBodyFat { get; set; }
    public double? MeasurementMuscleMass { get; set; }
    public double? MeasurementChestCm { get; set; }
    public double? MeasurementWaistCm { get; set; }
    public double? MeasurementHipCm { get; set; }
}
