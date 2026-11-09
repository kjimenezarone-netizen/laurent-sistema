import java.time.*;
import com.laurent.clinica.dominio.ReglasAgenda;

public final class ReglasAgendaTest {
 static int total=0;
 static void ok(boolean condicion,String descripcion){
  total++;if(!condicion)throw new AssertionError(descripcion);
 }
 public static void main(String[] args){
  var zone=ZoneId.of("America/Lima");
  var a=OffsetDateTime.parse("2026-11-09T09:00:00-05:00");
  var b=OffsetDateTime.parse("2026-11-09T10:00:00-05:00");
  ok(ReglasAgenda.cubreFranja(a,b,1,LocalTime.of(8,0),LocalTime.of(17,0),zone),"Cita cubierta");
  ok(!ReglasAgenda.cubreFranja(a,b,2,LocalTime.of(8,0),LocalTime.of(17,0),zone),"Día incorrecto");
  ok(!ReglasAgenda.cubreFranja(a,b,1,LocalTime.of(9,30),LocalTime.of(17,0),zone),"Comienzo fuera");
  ok(!ReglasAgenda.cubreFranja(a,b,1,LocalTime.of(8,0),LocalTime.of(9,30),zone),"Final fuera");
  ok(!ReglasAgenda.cubreFranja(a,b.plusDays(1),1,LocalTime.MIN,LocalTime.MAX,zone),"No cruzar día");
  Instant start=Instant.parse("2026-11-09T12:00:00Z");
  ok(ReglasAgenda.solapan(start,start.plusSeconds(3600),start.plusSeconds(1800),start.plusSeconds(5400)),"Cruce");
  ok(!ReglasAgenda.solapan(start,start.plusSeconds(3600),start.plusSeconds(3600),start.plusSeconds(7200)),"Límites adyacentes");
  System.out.println("APROBADAS: "+total+" pruebas de reglas de agenda");
 }
}
