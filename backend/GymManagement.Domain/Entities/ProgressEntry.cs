namespace GymManagement.Domain.Entities;

public class ProgressEntry
{
    public string Id { get; set; } = null!;

    public string MemberId { get; set; } = null!;

    public double? Weight { get; set; }
    public double? HeightCm { get; set; }
    public double? BodyFat { get; set; }
    public double? MuscleMass { get; set; }
    public double? RightArmCm { get; set; }
    public double? LeftArmCm { get; set; }
    public double? ShoulderCm { get; set; }
    public double? ChestCm { get; set; }
    public double? WaistCm { get; set; }
    public double? HipCm { get; set; }
    public string? Note { get; set; }

    public string? RecordedByUserId { get; set; }

    public string? RecordedByName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
