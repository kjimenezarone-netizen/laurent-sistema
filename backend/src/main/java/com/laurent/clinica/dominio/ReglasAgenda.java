package com.laurent.clinica.dominio;

import java.time.*;

/** Reglas puras, separadas de HTTP y persistencia, para facilitar pruebas. */
public final class ReglasAgenda {
 private ReglasAgenda(){}
 public static boolean solapan(Instant aInicio,Instant aFin,Instant bInicio,Instant bFin){
  if(!aInicio.isBefore(aFin)||!bInicio.isBefore(bFin))throw new IllegalArgumentException("Intervalo inválido");
  return aInicio.isBefore(bFin)&&bInicio.isBefore(aFin);
 }
 public static boolean cubreFranja(OffsetDateTime inicio,OffsetDateTime fin,int diaIso,
       LocalTime desde,LocalTime hasta,ZoneId zona){
  var a=inicio.atZoneSameInstant(zona);
  var b=fin.atZoneSameInstant(zona);
  return a.toLocalDate().equals(b.toLocalDate()) && a.getDayOfWeek().getValue()==diaIso
    && !a.toLocalTime().isBefore(desde) && !b.toLocalTime().isAfter(hasta);
 }
}
