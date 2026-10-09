(function () {
  'use strict';

  const WEBHOOK_URL = 'https://hook.eu2.make.com/kjdecrlfkbs9wc896hljt8ss6ippki53';

  const originalState = "  state = { step: 0, answers: {}, other: '', vals: {}, name: '', email: '', error: '' };";
  const patchedState = "  state = { step: 0, answers: {}, other: '', vals: {}, name: '', email: '', error: '', submitting: false };";

  const originalSubmit = String.raw`  submit = () => {
    const { name, email } = this.state;
    if (!name.trim()) return this.setState({ error: 'Escribe tu nombre.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return this.setState({ error: 'Escribe un correo válido.' });
    this.setState({ error: '', step: this.N + 2 });
  };`;

  const reportLogic = String.raw`  getReportData = () => {
    const { answers, other, vals, name, email } = this.state;
    const answerIndex = questionIndex => answers[questionIndex];
    const answerText = questionIndex => {
      const question = this.questions[questionIndex];
      const selected = answerIndex(questionIndex);
      if (!question || selected == null) return '';
      if (questionIndex === 0 && selected === question.otherIdx && other.trim()) return other.trim();
      return question.options[selected] || '';
    };
    const score = questionIndex => {
      const selected = answerIndex(questionIndex);
      return selected >= 0 && selected <= 3 ? selected + 1 : null;
    };

    const scores = {
      formacion: score(1),
      criterios: score(2),
      ritmo: score(3),
      datos: score(4),
      deteccion: score(5),
      continuidad: score(6)
    };

    const stateFor = value => value == null ? 'Sin datos' : value <= 2 ? 'Inicial' : value === 3 ? 'En marcha' : 'Consolidado';
    const colorFor = value => value == null ? 'GRIS' : value <= 2 ? 'ROJO' : value === 3 ? 'AMARILLO' : 'VERDE';
    const pointFieldsFor = (area, value) => {
      const activeColor = colorFor(value);
      return Object.fromEntries(
        ['ROJO', 'AMARILLO', 'VERDE', 'GRIS'].map(color => [
          'PUNTO_' + area + '_' + color,
          activeColor === color ? '●' : ''
        ])
      );
    };

    const concernTexts = [
      'los resultados en las evaluaciones externas',
      'las dudas, quejas o presión de las familias',
      'que el profesorado pide más herramientas y formación',
      'que hay niños y niñas que no avanzan y no tenéis claro por qué',
      'que cada aula o cada etapa trabaja de forma distinta',
      other.trim()
    ];
    const concern = concernTexts[answerIndex(0)] || answerText(0);

    const knownScores = Object.values(scores).filter(value => value != null);
    const average = knownScores.length
      ? knownScores.reduce((total, value) => total + value, 0) / knownScores.length
      : null;
    let globalLevel = 'Sin datos suficientes';
    let globalSummary = 'No hay información suficiente para situar el punto de partida del centro. Las respuestas que faltan son, precisamente, las primeras áreas que conviene mirar con el equipo.';
    if (average != null && average <= 2) {
      globalLevel = 'Etapa inicial';
      globalSummary = 'Vuestro centro se encuentra en una etapa inicial. Hay prácticas valiosas, pero todavía no forman un recorrido común y estable de Infantil a Primaria.';
    } else if (average != null && average < 3.5) {
      globalLevel = 'Etapa de transición';
      globalSummary = 'Vuestro centro se encuentra en etapa de transición. Hay acuerdos y buena voluntad, pero el proceso de alfabetización todavía se sostiene en las personas, más que en un recorrido común de Infantil a Primaria.';
    } else if (average != null) {
      globalLevel = 'Base sólida';
      globalSummary = 'Vuestro centro cuenta con una base sólida. El reto está en sostenerla cuando cambian los equipos y en afinar la respuesta para los niños y niñas que no avanzan al ritmo del grupo.';
    }

    const strengthOrder = ['deteccion', 'formacion', 'criterios', 'ritmo', 'datos', 'continuidad'];
    const strengthTexts = {
      formacion: 'El claustro ha compartido una formación común: tenéis un punto de partida compartido.',
      criterios: 'Ya existen acuerdos sobre qué enseñar y en qué orden.',
      ritmo: 'La expectativa sobre cuándo deben leer da tiempo a consolidar las bases.',
      datos: 'El centro tiene un dato común sobre cómo leen sus alumnos al terminar 1º.',
      continuidad: 'Lo trabajado en Infantil se retoma en 1º.'
    };
    const strengths = strengthOrder
      .filter(area => scores[area] >= 3)
      .sort((a, b) => scores[b] - scores[a] || strengthOrder.indexOf(a) - strengthOrder.indexOf(b))
      .slice(0, 2)
      .map(area => area === 'deteccion'
        ? scores.deteccion === 4
          ? 'Las dificultades se detectan a tiempo y se sabe qué habilidad trabajar.'
          : 'Vuestro equipo detecta las dificultades a tiempo, ya en Infantil, y las deriva para valorarlas.'
        : strengthTexts[area]);
    const strengthFallbacks = [
      'El equipo ha dado un primer paso importante: poner la lectoescritura en común y hacer visible lo que todavía necesita aclararse.',
      'Las respuestas permiten señalar preguntas concretas para avanzar sin añadir acciones desconectadas.'
    ];
    const displayedStrengths = [...strengths];
    strengthFallbacks.forEach(text => {
      if (displayedStrengths.length < 2) displayedStrengths.push(text);
    });

    const noDataText = 'Sin datos. Es un área que conviene mirar con el equipo.';
    const mapTexts = {
      formacion: [
        'En los últimos cursos no ha habido formación común: cada docente enseña con lo que trae de su formación inicial y su experiencia.',
        'El equipo se forma, pero por caminos distintos: conviven enfoques que no siempre se hablan entre sí.',
        'Hubo formación común, pero su aplicación quedó en manos de cada docente. Sin acuerdos ni acompañamiento, lo aprendido suele diluirse en pocos meses.',
        'La formación se tradujo en acuerdos y tuvo seguimiento en el aula: es la base que permite sostener cambios.',
        noDataText
      ],
      criterios: [
        'El orden de enseñanza depende de cada docente: un mismo niño puede vivir tres secuencias distintas en tres cursos.',
        'El orden lo marca la editorial. Da estructura, pero el libro no conoce a vuestro alumnado, y Infantil y Primaria suelen trabajar con materiales de lógicas distintas.',
        'Cada etapa tiene su orden, pero el recorrido se corta en el paso de una a otra.',
        'Hay criterios comunes de Infantil a Primaria que todo el equipo conoce: es el pilar de un proyecto de centro.',
        noDataText
      ],
      ritmo: [
        'Se espera que lean al terminar Infantil. Es una expectativa exigente que suele llevar a enseñar el código antes de que las bases estén firmes.',
        'La presión se concentra en el primer trimestre de 1º: quien no llega a tiempo empieza a verse como un niño "con dificultades".',
        'La expectativa está en el final de 1º, un plazo razonable si se acompaña de seguimiento.',
        'Hay una mirada de proceso: el ritmo se ajusta a cada niño o niña dentro del primer ciclo.',
        noDataText
      ],
      datos: [
        'No hay un dato de cuántos alumnos terminan 1º leyendo: las decisiones se toman sin conocer el tamaño real del reto.',
        'El progreso se estima con notas e impresiones: información valiosa, pero no comparable entre aulas.',
        'Hay un dato común, pero llega a final de curso, cuando ya no da tiempo a actuar con ese grupo.',
        'Hay seguimiento durante el curso con una referencia común: el centro puede actuar a tiempo.',
        noDataText
      ],
      deteccion: [
        'Las dificultades se ven cuando el niño ya va por detrás. A esas alturas, recuperar cuesta más y la familia suele llegar preocupada.',
        'Las dificultades se ven a tiempo, ya en Infantil, y eso es una fortaleza. Lo que falta es una mirada común: hoy depende de cómo observa cada tutor o tutora.',
        'Las dificultades se ven a tiempo y se derivan, pero sin saber qué habilidad trabajar en el aula: el apoyo tiende a ser genérico.',
        'Se detecta a tiempo y con precisión: se sabe qué habilidad trabajar.',
        noDataText
      ],
      continuidad: [
        '1º empieza de cero: se pierde lo construido en Infantil y se repite lo que algunos ya dominan.',
        'El paso a 1º supone un cambio brusco en la forma de trabajar. Es habitual que niños que iban bien se desajusten en el primer trimestre.',
        'Se retoma lo hecho, pero cada docente a su manera: la continuidad depende de quién reciba al grupo.',
        '1º parte de lo que domina cada niño, con el mismo lenguaje que Infantil.',
        noDataText
      ]
    };
    const mapText = (area, questionIndex) => mapTexts[area][answerIndex(questionIndex)] || noDataText;

    const crosses = [];
    const addCross = (condition, text, areas) => {
      if (condition && crosses.length < 3) crosses.push({ text, areas });
    };
    const p1 = answerIndex(0);
    addCross(p1 === 4 && scores.criterios != null && scores.criterios <= 3,
      'Tu preocupación tiene una explicación en tus propias respuestas: no hay criterios comunes para alfabetizar de Infantil a Primaria. Mientras eso no exista, cada aula seguirá funcionando a su manera, por mucho compromiso que tenga el equipo.', ['criterios']);
    addCross(p1 === 3 && scores.ritmo != null && scores.ritmo <= 2,
      'Parte de los niños que "no avanzan" puede estar respondiendo a un ritmo exigido, no a una dificultad. Cuando la expectativa llega pronto, quien necesita algo más de tiempo parece ir por detrás.', ['ritmo']);
    addCross(p1 === 0 && scores.datos != null && scores.datos <= 2,
      'Os preocupan los resultados externos, pero el centro no tiene un dato propio que los anticipe: el problema se descubre cuando llega la prueba, y no antes.', ['datos']);
    addCross(p1 === 1 && scores.datos != null && scores.datos <= 2,
      'Sin un dato común, cada tutor o tutora responde a las familias desde su propia mirada. Mensajes distintos ante la misma preocupación generan dudas, y a veces desconfianza.', ['datos']);
    addCross(p1 === 2 && scores.formacion != null && scores.formacion >= 3,
      'El equipo ya se ha formado. Lo que pide quizá no es más formación, sino acompañamiento para llevar lo aprendido al aula.', ['formacion']);

    addCross(scores.ritmo != null && scores.ritmo <= 2 && scores.deteccion != null && scores.deteccion <= 2,
      'Cuando se espera que lean pronto y la detección no parte de una mirada compartida, es difícil distinguir a un niño con una dificultad real de uno que todavía no ha llegado al ritmo exigido. El riesgo es doble: derivar casos que no lo necesitan y no ver a tiempo los que sí.', ['ritmo', 'deteccion']);
    addCross(scores.ritmo != null && scores.ritmo <= 2 && scores.continuidad != null && scores.continuidad <= 3,
      'Infantil adelanta y 1º no retoma con un lenguaje común: el niño vive dos ritmos que no se hablan. Lo que se aprendió deprisa no siempre está consolidado, y 1º no siempre lo sabe.', ['ritmo', 'continuidad']);
    addCross(scores.formacion === 3 && scores.criterios != null && scores.criterios <= 3,
      'La formación llegó, pero no se tradujo en acuerdos. El conocimiento ya está en el claustro; lo que falta es convertirlo en decisiones comunes.', ['formacion', 'criterios']);
    addCross(scores.criterios === 2 && scores.continuidad != null && scores.continuidad <= 3,
      'El libro ordena cada curso, pero no garantiza la continuidad. Si Infantil y Primaria trabajan con materiales de lógicas distintas, el recorrido se rompe en el paso de etapa.', ['criterios', 'continuidad']);
    addCross(scores.deteccion === 2 && scores.datos != null && scores.datos <= 2,
      'Vuestro equipo ve cosas, pero no las registra con una referencia común: la información existe, pero se queda en cada aula y no llega a las decisiones del centro.', ['deteccion', 'datos']);
    addCross(scores.ritmo === 4 && scores.continuidad != null && scores.continuidad <= 2,
      'Hay una mirada de proceso, pero se rompe en el paso a 1º: lo que Infantil cuida, Primaria no siempre lo recoge.', ['ritmo', 'continuidad']);
    const noDataCount = Object.values(scores).filter(value => value == null).length;
    addCross(noDataCount >= 3,
      'Lo más significativo de este informe es lo que no se sabe. No es un fallo de quien responde: indica que la información sobre la alfabetización no circula hasta el equipo directivo.', ['pocos_datos']);

    const priorityOrder = ['criterios', 'ritmo', 'deteccion', 'continuidad', 'datos', 'formacion'];
    const allConsolidated = Object.values(scores).every(value => value === 4);
    const scoredAreas = priorityOrder.filter(area => scores[area] != null);
    const minimum = scoredAreas.length ? Math.min(...scoredAreas.map(area => scores[area])) : null;
    const priorityArea = allConsolidated ? 'base_solida' : scoredAreas.find(area => scores[area] === minimum) || 'pocos_datos';

    const priorities = {
      criterios: {
        title: 'Criterios comunes para alfabetizar',
        description: 'Es la base de todo lo demás.',
        foundation: 'Sin criterios comunes, la detección, la continuidad y los datos no tienen una referencia con la que comparar.',
        students: 'Cada curso empieza de nuevo, con otro orden y otras palabras.',
        center: 'Los resultados dependen de la docente que toque, y es difícil explicar a las familias por qué un grupo avanza distinto que otro.'
      },
      ritmo: {
        title: 'Ritmo de la alfabetización',
        description: 'El ritmo decide qué se enseña y quién parece tener dificultades.',
        foundation: 'Cuando la expectativa es temprana, todo se organiza para llegar a ese plazo, aunque las bases no estén firmes.',
        students: 'Niños que necesitaban algo más de tiempo empiezan a verse, y a vivirse, como niños con dificultades.',
        center: 'Más preocupación en las familias, más comparaciones entre niños y más derivaciones a orientación.'
      },
      continuidad: {
        title: 'Continuidad entre etapas',
        description: 'El paso a 1º es el momento de más riesgo en todo el recorrido.',
        foundation: 'Es donde se une, o se rompe, todo lo que Infantil ha construido.',
        students: 'Un cambio de ritmo, de forma de trabajar y de lenguaje justo cuando empiezan a leer.',
        center: 'Dos etapas que funcionan como dos escuelas en un mismo edificio, y el esfuerzo de Infantil que no se aprovecha.'
      },
      datos: {
        title: 'Datos para decidir',
        description: 'Sin un dato común, el centro decide a ciegas.',
        foundation: 'El dato permite saber si algo funciona y dónde poner los apoyos.',
        students: 'Los apoyos llegan cuando la dificultad ya es evidente.',
        center: 'Sorpresas en las evaluaciones externas y respuestas distintas ante las mismas preguntas de las familias.'
      },
      formacion: {
        title: 'Formación que llega al aula',
        description: 'Formar no basta si lo aprendido no se convierte en práctica común.',
        foundation: 'La formación es la inversión que debería mover todo lo demás.',
        students: 'Experiencias distintas según el aula que les toque.',
        center: 'Tiempo y dinero invertidos con poco cambio visible, y un equipo que empieza a vivir cada formación como "una más".'
      },
      pocos_datos: {
        title: 'Información compartida sobre el proceso',
        description: 'Antes de priorizar un cambio, conviene reunir la información que hoy está dispersa en el centro.',
        foundation: 'Sin una mirada completa, cualquier prioridad sería una hipótesis.',
        students: 'Las necesidades pueden recibir respuestas distintas según quién las observe.',
        center: 'El equipo directivo decide sin poder ver el recorrido completo de Infantil a Primaria.'
      },
      base_solida: {
        title: 'Sostener una base sólida',
        description: 'Vuestra base es sólida. El reto ahora está en sostenerla cuando cambian los equipos y en afinar la mirada sobre los niños que no avanzan al ritmo del grupo.',
        foundation: 'La clave no es introducir un método nuevo, sino proteger los acuerdos, documentarlos y revisarlos con datos comunes.',
        students: 'El alumnado recibe un recorrido coherente y los apoyos pueden ajustarse antes cuando alguien necesita más tiempo.',
        center: 'El centro puede concentrarse en sostener los acuerdos, acompañar a las nuevas incorporaciones y afinar el seguimiento.'
      }
    };
    priorities.deteccion = scores.deteccion === 1 ? {
      title: 'Detección temprana',
      description: 'Cuanto antes se ve una dificultad, menos cuesta acompañarla.',
      foundation: 'De la detección depende que los apoyos lleguen a tiempo.',
      students: 'Cuanto más tarde se actúa, más esfuerzo les cuesta recuperar y más se resiente su confianza ante la lectura.',
      center: 'Orientación desbordada, apoyos que llegan en 2º o 3º y familias que preguntan por qué no se vio antes.'
    } : {
      title: 'Detección temprana',
      description: 'Vuestro equipo ve a tiempo, pero lo que una tutora detecta, otra puede no verlo, y lo que se detecta no siempre se traduce en un apoyo concreto.',
      foundation: 'Una mirada común convierte la intuición de cada tutora en información que el centro puede usar.',
      students: 'El mismo niño puede recibir un apoyo o no según el aula que le toque.',
      center: 'Detecciones que se quedan en cada aula, derivaciones que llegan sin la información necesaria y una orientación que tiene que empezar de cero con cada caso.'
    };
    const priority = priorities[priorityArea];

    const questionByArea = {
      criterios: '¿Qué orden de letras sigue hoy cada tutor o tutora de Infantil 5 y de 1º? ¿Quién lo decidió y cuándo?',
      ritmo: '¿De dónde viene la expectativa sobre cuándo deben leer: del equipo, del libro, de las familias?',
      deteccion: '¿Qué pasa hoy desde que una tutora sospecha algo hasta que el niño recibe un apoyo?',
      continuidad: 'En septiembre, ¿qué sabe la tutora de 1º de lo que domina cada niño que llega de Infantil?',
      datos: '¿Qué dato os gustaría tener en junio para decidir los apoyos de septiembre?',
      formacion: '¿Qué cambió en las aulas tras la última formación, y qué se quedó en el papel?',
      pocos_datos: '¿Quién tiene hoy en el centro la información sobre cómo aprenden a leer vuestros alumnos?',
      base_solida: '¿Qué necesita el centro para sostener esta base cuando cambian los equipos?'
    };
    const questionAreas = [priorityArea];
    crosses.forEach(cross => cross.areas.forEach(area => {
      if (!questionAreas.includes(area)) questionAreas.push(area);
    }));
    const explorationQuestions = questionAreas
      .map(area => questionByArea[area])
      .filter(Boolean)
      .slice(0, 3);
    const fallbackQuestions = [
      '¿Qué de esta lectura reconoce el equipo y qué habría que matizar?',
      '¿Qué acuerdo concreto tendría más impacto si se sostuviera en todas las aulas?',
      '¿Qué información necesitáis recoger para saber si el cambio está funcionando?'
    ];
    fallbackQuestions.forEach(question => {
      if (explorationQuestions.length < 3 && !explorationQuestions.includes(question)) {
        explorationQuestions.push(question);
      }
    });

    const levelFinding = allConsolidated
      ? 'Las respuestas dibujan un recorrido coherente de Infantil a Primaria, con acuerdos, seguimiento y capacidad de detección.'
      : average == null
        ? 'Antes de interpretar el proceso, conviene reunir la información que hoy está dispersa entre aulas y etapas.'
        : average <= 2
          ? 'Las respuestas muestran que las dificultades no se concentran en una sola área: formación, criterios, seguimiento y continuidad necesitan ordenarse como un recorrido común.'
          : average < 3.5
            ? 'El centro ya tiene algunos apoyos sobre los que construir, pero todavía falta convertirlos en acuerdos que se sostengan entre aulas y etapas.'
            : 'La base está consolidada en la mayoría de las áreas; el reto consiste en conectar esa solidez con el punto concreto que rompe el recorrido.';
    const findingFallbacks = [
      levelFinding,
      'El mapa señala dónde conviene concentrar la conversación del equipo: no para añadir más acciones, sino para alinear las que ya existen.',
      'La prioridad propuesta debe contrastarse con el claustro para comprobar si refleja la práctica cotidiana y decidir el siguiente paso.'
    ];
    const integratedFindings = crosses.map(cross => cross.text);
    findingFallbacks.forEach(text => {
      if (integratedFindings.length < 3 && !integratedFindings.includes(text)) {
        integratedFindings.push(text);
      }
    });

    const placeholders = {
      NOMBRE_CENTRO: (vals.centro || '').trim(),
      PREOCUPACION_PRINCIPAL: concern,
      RESUMEN_SITUACION_CENTRO: globalSummary,
      FORTALEZA_1: displayedStrengths[0],
      FORTALEZA_2: displayedStrengths[1],
      CIERRE_FORTALEZAS: strengths.length
        ? 'Es una base desde la que construir, no desde la que empezar.'
        : 'Es un punto de partida desde el que ordenar prioridades y tomar decisiones comunes.',
      ANALISIS_FORMACION_AULA: mapText('formacion', 1),
      ...pointFieldsFor('FORMACION', scores.formacion),
      ESTADO_FORMACION: stateFor(scores.formacion),
      ANALISIS_CRITERIOS_COMUNES: mapText('criterios', 2),
      ...pointFieldsFor('CRITERIOS', scores.criterios),
      ESTADO_CRITERIOS: stateFor(scores.criterios),
      ANALISIS_RITMO_ALFABETIZACION: mapText('ritmo', 3),
      ...pointFieldsFor('RITMO', scores.ritmo),
      ESTADO_RITMO: stateFor(scores.ritmo),
      ANALISIS_DATOS_PARA_DECIDIR: mapText('datos', 4),
      ...pointFieldsFor('DATOS', scores.datos),
      ESTADO_DATOS: stateFor(scores.datos),
      ANALISIS_DETECCION_TEMPRANA: mapText('deteccion', 5),
      ...pointFieldsFor('DETECCION', scores.deteccion),
      ESTADO_DETECCION: stateFor(scores.deteccion),
      ANALISIS_CONTINUIDAD_ENTRE_ETAPAS: mapText('continuidad', 6),
      ...pointFieldsFor('TRANSICION', scores.continuidad),
      ESTADO_TRANSICION: stateFor(scores.continuidad),
      HALLAZGO_INTEGRADO_1: integratedFindings[0],
      HALLAZGO_INTEGRADO_2: integratedFindings[1],
      HALLAZGO_INTEGRADO_3: integratedFindings[2],
      TITULO_PRIORIDAD: priority.title,
      DESCRIPCION_PRIORIDAD: priority.description,
      FUNDAMENTO_PRIORIDAD: priority.foundation,
      IMPACTO_PRIORIDAD_ALUMNADO: priority.students,
      IMPACTO_PRIORIDAD_CENTRO: priority.center,
      PREGUNTA_EXPLORACION_1: explorationQuestions[0],
      PREGUNTA_EXPLORACION_2: explorationQuestions[1],
      PREGUNTA_EXPLORACION_3: explorationQuestions[2],
      RESPUESTA_PREOCUPACION_PRINCIPAL: answerText(0),
      RESPUESTA_FORMACION_CLAUSTRO: answerText(1),
      RESPUESTA_CRITERIOS_NUEVO_DOCENTE: answerText(2),
      RESPUESTA_MOMENTO_LECTURA_AUTONOMA: answerText(3),
      RESPUESTA_MEDICION_LECTURA_AUTONOMA: answerText(4),
      RESPUESTA_DETECCION_DIFICULTADES: answerText(5),
      RESPUESTA_CONTINUIDAD_ENTRE_ETAPAS: answerText(6)
    };

    return {
      ...placeholders,
      EMAIL: email.trim(),
      PRIMER_NOMBRE: name.trim().split(/\s+/)[0] || '',
      CONTACTO: {
        NOMBRE: name.trim(),
        EMAIL: email.trim(),
        CENTRO: (vals.centro || '').trim(),
        CARGO: (vals.cargo || '').trim(),
        LOCALIDAD: (vals.localidad || '').trim()
      },
      RESULTADOS: {
        PUNTUACIONES: scores,
        MEDIA_GLOBAL: average == null ? null : Number(average.toFixed(2)),
        NIVEL_GLOBAL: globalLevel,
        PRIORIDAD: priorityArea,
        SEMAFORO: Object.fromEntries(Object.entries(scores).map(([area, value]) => [area, colorFor(value)])),
        NUMERO_FORTALEZAS: strengths.length,
        NUMERO_HALLAZGOS: crosses.length,
        NUMERO_SIN_DATOS: noDataCount
      },
      CONTROL_PLANTILLA: {
        MOSTRAR_FORTALEZAS: strengths.length > 0,
        MOSTRAR_FORTALEZA_2: strengths.length > 1,
        MOSTRAR_HALLAZGOS: crosses.length > 0,
        MOSTRAR_HALLAZGO_2: crosses.length > 1,
        MOSTRAR_HALLAZGO_3: crosses.length > 2,
        MOSTRAR_RAZONES_PRIORIDAD: priorityArea !== 'base_solida',
        MOSTRAR_PREGUNTA_3: explorationQuestions.length > 2
      },
      META: {
        VERSION_REGLAS: '2026-10-09',
        ORIGEN: 'cuestionario-lectoludica',
        FECHA_ENVIO: new Date().toISOString()
      }
    };
  };

  submit = async () => {
    const { name, email, submitting } = this.state;
    if (submitting) return;
    if (!name.trim()) return this.setState({ error: 'Escribe tu nombre.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return this.setState({ error: 'Escribe un correo válido.' });

    this.setState({ error: '', submitting: true });
    try {
      const payload = this.getReportData();
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        const serialized = value != null && typeof value === 'object'
          ? JSON.stringify(value)
          : String(value ?? '');
        formData.append(key, serialized);
      });
      await fetch('${WEBHOOK_URL}', {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      this.setState({ error: '', submitting: false, step: this.N + 2 });
    } catch (error) {
      console.error('No se pudo enviar el cuestionario:', error);
      this.setState({
        submitting: false,
        error: 'No pudimos enviar tus respuestas. Revisa tu conexión e inténtalo de nuevo.'
      });
    }
  };`;

  window.__patchLectoludicaTemplate = function (template) {
    if (!template.includes(originalState)) {
      throw new Error('No se encontró el estado original del cuestionario.');
    }
    if (!template.includes(originalSubmit)) {
      throw new Error('No se encontró el envío original del cuestionario.');
    }

    let patched = template
      .replace(originalState, patchedState)
      .replace(originalSubmit, reportLogic)
      .replace('line-height:1.02;letter-spacing:-.02em', 'line-height:1.12;letter-spacing:-.02em')
      .replace('Descubre cómo detecta tu centro las <em style="font-style:italic;font-weight:500">dificultades lectoras</em>', 'Descubre en qué punto está tu colegio en <em style="font-style:italic;font-weight:500">lectoescritura</em>')
      .replace('>Recibir mi informe <span style="font-size:18px">→</span></button>', '>{{ submitLabel }} <span style="font-size:18px">→</span></button>')
      .replace('name, email, error, firstName:', 'name, email, error, submitLabel: this.state.submitting ? \'Generando informe…\' : \'Recibir mi informe\', firstName:');

    return patched;
  };
})();
