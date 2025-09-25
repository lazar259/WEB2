using System.Text.Json;
using System.Text.Json.Serialization;

namespace QuizHub.Converters
{
    public class UtcDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (string.IsNullOrEmpty(value))
                return default;

            if (DateTime.TryParse(value, out var result))
            {
                // Ensure the parsed DateTime is treated as UTC
                return DateTime.SpecifyKind(result, DateTimeKind.Utc);
            }

            return default;
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            // Ensure the DateTime is converted to UTC and formatted with Z suffix
            var utcValue = value.Kind == DateTimeKind.Local ? value.ToUniversalTime() :
                          value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(value, DateTimeKind.Utc) : value;

            writer.WriteStringValue(utcValue.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
        }
    }

    public class UtcNullableDateTimeConverter : JsonConverter<DateTime?>
    {
        public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (string.IsNullOrEmpty(value))
                return null;

            if (DateTime.TryParse(value, out var result))
            {
                // Ensure the parsed DateTime is treated as UTC
                return DateTime.SpecifyKind(result, DateTimeKind.Utc);
            }

            return null;
        }

        public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
            {
                // Ensure the DateTime is converted to UTC and formatted with Z suffix
                var utcValue = value.Value.Kind == DateTimeKind.Local ? value.Value.ToUniversalTime() :
                              value.Value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : value.Value;

                writer.WriteStringValue(utcValue.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
            }
            else
            {
                writer.WriteNullValue();
            }
        }
    }
}