(function () {
  'use strict';

  const WEBHOOK_URL = 'https://hook.eu2.make.com/p5iogt3owpam91qib0krdxxt0wc9g4jl';

  const originalState = "  state = { step: 0, answers: {}, other: '', vals: {}, name: '', email: '', error: '' };";
  const patchedState = "  state = { step: 0, answers: {}, other: '', vals: {}, name: '', email: '', error: '', submitting: false };";

  const originalSubmit = String.raw`  submit = () => {
    const { name, email } = this.state;
    if (!name.trim()) return this.setState({ error: 'Escribe tu nombre.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return this.setState({ error: 'Escribe un correo válido.' });
    this.setState({ error: '', step: this.N + 2 });
  };`;

  const questionsLogic = String.raw`  get questions() { return [
    { id: 'preocupacion', text: '¿Qué es lo que más te preocupa hoy en lectoescritura?', hint: 'Elige una.', options: [
      'Los resultados en las evaluaciones externas.',
      'Las familias: dudas, quejas o presión.',
      'Que el profesorado pide más herramientas y formación.',
      'Niños y niñas que no avanzan y no tenemos claro por qué.',
      'Que cada aula o cada etapa trabaja de forma distinta.'] },
    { id: 'formacion', text: '¿Cómo ha sido la formación en lectoescritura del claustro en los últimos cursos?', options: [
      'No ha habido formación de lectoescritura.',
      'Cada docente se forma por su cuenta, y no siempre en lo mismo.',
      'Formación para todo el claustro, y luego cada docente la aplicó como pudo.',
      'Formación para todo el claustro, y luego alguien acompañó o revisó cómo se aplicaba en el aula.',
      'No lo sé.'] },
    { id: 'criterios', text: 'Cuando llega un docente nuevo a vuestro centro, ¿cómo sabe qué tiene que enseñar en lectoescritura y en qué orden?', options: [
      'Lo decide según su experiencia.',
      'Sigue el libro o el método de la editorial.',
      'Tenemos acuerdos por etapa (Infantil por un lado y Primaria por otro).',
      'Hay un documento o una secuencia común, de Infantil a Primaria, que todo el equipo conoce y usa.',
      'No lo sé.'] },
    { id: 'ritmo', text: '¿En qué momento se espera en vuestro centro que un niño o niña lea de forma autónoma?', options: [
      'Al terminar Infantil.',
      'A mitad de 1º.',
      'Al terminar 1º.',
      'Depende de cada niño o niña, a lo largo del primer ciclo.',
      'No lo sé.'] },
    { id: 'infantil_5', text: 'En Infantil 5, ¿en qué se centra sobre todo el trabajo de lectoescritura?', options: [
      'En conocer las letras y su trazo, con fichas.',
      'En empezar a leer y escribir palabras.',
      'En el lenguaje oral y el juego con los sonidos, antes de las letras.',
      'En una secuencia planificada que va de los sonidos a las letras y a la lectura.',
      'No lo sé.'] },
    { id: 'continuidad', text: 'Al empezar 1º, ¿desde dónde se arranca en lectoescritura?', options: [
      'Desde el principio del libro de 1º: repaso general para todo el grupo y paso a la ficha y el libro.',
      'Lo trabajado en Infantil se retoma, pero cada docente decide cuánto y cómo desde su experiencia: la continuidad depende de quién reciba al grupo.',
      'La tutora de Infantil pasa información del grupo y 1º la tiene en cuenta, pero sin un lenguaje común entre etapas.',
      'Se parte de lo que domina cada niño, con información individual de Infantil y el mismo lenguaje en las dos etapas.',
      'No lo sé.'] },
    { id: 'deteccion', text: 'Piensa en el último niño o niña con dificultades para leer que habéis detectado. ¿Cuándo se notó y qué se sabía de su dificultad?', options: [
      'Se notó en 1º o 2º de Primaria, cuando ya iba por detrás del grupo.',
      'Se notó en Infantil, pero cada tutor o tutora observa a su manera: no hay una mirada común en el equipo.',
      'Se notó en Infantil y se derivó a orientación, pero no se supo qué habilidad trabajar en el aula.',
      'Se notó en Infantil con una mirada común del equipo, y se supo qué habilidad concreta trabajar.',
      'No ha habido ningún caso o no lo sé.'] },
    { id: 'datos', text: 'Al terminar 1º, ¿sabéis qué porcentaje del alumnado lee de forma autónoma (palabras y frases sencillas, con precisión)?', options: [
      'No tenemos ese dato.',
      'Lo estimamos por las notas o la impresión de cada tutor o tutora.',
      'Sí, con una prueba común a final de curso.',
      'Sí, y además hacemos seguimiento durante el curso con una referencia común.',
      'No lo sé.'] },
    { id: 'mejora', text: 'Si este curso pudierais mejorar algo en lectoescritura, ¿qué os ayudaría más?', options: [
      'Formación para el claustro.',
      'Material de referencia común.',
      'Acompañamiento en el aula.',
      'Herramientas para detectar a tiempo.'] },
    { id: 'plan_formacion', text: '¿La lectoescritura está en el plan de formación del centro para este curso?', options: [
      'No.',
      'Se está valorando.',
      'Sí, pero sin concretar.',
      'Sí, ya está planificada.'] }
  ]; }
`;

  const reportLogic = String.raw`  getReportData = () => {
    const { answers, other, vals, name, email } = this.state;
    const questionIndexes = Object.fromEntries(this.questions.map((question, index) => [question.id, index]));
    const answerIndex = questionId => answers[questionIndexes[questionId]];
    const answerText = questionId => {
      const question = this.questions[questionIndexes[questionId]];
      const selected = answerIndex(questionId);
      if (!question || selected == null) return '';
      return question.options[selected] || '';
    };
    const score = questionId => {
      const selected = answerIndex(questionId);
      return selected >= 0 && selected <= 3 ? selected + 1 : null;
    };
    const detectionScore = () => {
      const selected = answerIndex('deteccion');
      if (selected === 0) return 1;
      if (selected === 1 || selected === 2) return 3;
      if (selected === 3) return 4;
      return null;
    };

    const scores = {
      formacion: score('formacion'),
      criterios: score('criterios'),
      ritmo: score('ritmo'),
      datos: score('datos'),
      deteccion: detectionScore(),
      continuidad: score('continuidad')
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
    ];
    const concern = concernTexts[answerIndex('preocupacion')] || answerText('preocupacion');

    const knownScores = Object.values(scores).filter(value => value != null);
    const average = knownScores.length
      ? knownScores.reduce((total, value) => total + value, 0) / knownScores.length
      : null;
    let globalLevel = 'Sin datos suficientes';
    let globalSummary = 'No hay información suficiente para situar el punto de partida del centro. Las respuestas que faltan son, precisamente, las primeras áreas que conviene mirar con el equipo.';
    if (average != null && average <= 2) {
      globalLevel = 'Etapa inicial';
      globalSummary = 'Vuestro centro se encuentra en una etapa inicial. Hay prácticas valiosas, pero todavía no forman un recorrido estable de Infantil a Primaria.';
    } else if (average != null && average < 3.5) {
      globalLevel = 'Etapa de transición';
      globalSummary = 'Vuestro centro se encuentra en etapa de transición. Hay acuerdos y buena voluntad, pero el proceso de alfabetización todavía depende de las personas más que de un recorrido pensado de Infantil a Primaria.';
    } else if (average != null) {
      globalLevel = 'Base sólida';
      globalSummary = 'Vuestro centro cuenta con una base sólida. El reto está en sostenerla cuando cambian los equipos y en afinar la respuesta para los niños y niñas que no avanzan al ritmo del grupo.';
    }

    const strengthOrder = ['deteccion', 'formacion', 'criterios', 'ritmo', 'datos', 'continuidad'];
    const strengthTexts = {
      formacion: 'Todo el claustro ha pasado por la misma formación en lectoescritura: tenéis un punto de partida para construir.',
      criterios: 'Ya existen acuerdos sobre qué enseñar y en qué orden.',
      ritmo: 'La expectativa sobre cuándo deben leer da tiempo a consolidar las bases.',
      datos: 'El centro sabe cómo leen sus alumnos al terminar 1º, con una prueba igual para todos.',
      continuidad: 'Lo trabajado en Infantil se retoma en 1º.'
    };
    const strengths = strengthOrder
      .filter(area => scores[area] >= 3)
      .sort((a, b) => scores[b] - scores[a] || strengthOrder.indexOf(a) - strengthOrder.indexOf(b))
      .slice(0, 2)
      .map(area => {
        if (area !== 'deteccion') return strengthTexts[area];
        if (scores.deteccion === 4) {
          return 'Las dificultades se detectan a tiempo y se sabe qué habilidad trabajar.';
        }
        return answerIndex('deteccion') === 1
          ? 'Vuestro equipo detecta las dificultades a tiempo, ya en Infantil. Esa detección temprana es una base valiosa.'
          : 'Vuestro equipo detecta las dificultades a tiempo, ya en Infantil, y las deriva para valorarlas.';
      });
    const strengthFallbacks = [
      'Tenéis identificado qué os preocupa en lectoescritura, y eso permite decidir por dónde empezar a trabajar.',
      'Las respuestas permiten señalar preguntas concretas para avanzar sin añadir acciones desconectadas.'
    ];
    const displayedStrengths = [...strengths];
    strengthFallbacks.forEach(text => {
      if (displayedStrengths.length < 2) displayedStrengths.push(text);
    });

    const noDataText = 'Sin datos. Es un área que conviene mirar con el equipo.';
    const mapTexts = {
      formacion: [
        'En los últimos cursos el claustro no ha tenido formación en lectoescritura. Cada docente enseña desde su formación inicial y su experiencia.',
        'El equipo se forma, pero por caminos distintos: conviven enfoques que no siempre se hablan entre sí.',
        'Todo el claustro se formó en lectoescritura y después cada docente lo aplicó a su manera. Lo que cambió en cada aula todavía no se ha recogido como práctica del centro.',
        'Tras la formación del claustro, alguien acompañó o revisó su aplicación en el aula: es una base valiosa para sostener los cambios.',
        noDataText
      ],
      criterios: [
        'El orden de enseñanza depende de cada docente: un mismo niño puede vivir tres secuencias distintas en tres cursos.',
        'Quien llega nuevo se orienta por el libro de la editorial. Le da un orden para su curso, pero no le cuenta qué se trabajó antes ni cómo enseña el resto del equipo.',
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
        'El avance lector se conoce por las notas y las impresiones de cada aula. Con esa información cuesta comparar grupos o decidir a quién reforzar primero.',
        'Hay una prueba de final de curso, pero el dato llega cuando ya no da tiempo a actuar con ese grupo.',
        'El avance lector se sigue durante el curso, no solo al final, y eso permite actuar a tiempo.',
        noDataText
      ],
      deteccion: [
        'Las dificultades se ven cuando el niño ya va por detrás. A esas alturas, recuperar le cuesta más esfuerzo.',
        'Las dificultades se ven ya en Infantil, y eso es una fortaleza. Qué se considera una señal de alerta varía de un aula a otra.',
        'Las dificultades se ven a tiempo y se derivan, pero sin saber qué habilidad trabajar en el aula: el apoyo tiende a ser genérico.',
        'Se detecta a tiempo y con precisión: se sabe qué habilidad trabajar.',
        noDataText
      ],
      continuidad: [
        '1º arranca con un repaso general marcado por el libro y pasa a la ficha: el punto de partida no se ajusta a lo que domina cada niño.',
        'Se retoma lo trabajado en Infantil, pero cada docente decide cuánto y cómo: la continuidad depende de quién reciba al grupo.',
        'Infantil comparte información del grupo y 1º la tiene en cuenta, aunque una misma expresión, como «ya lee», puede significar cosas distintas en cada etapa.',
        '1º parte de lo que domina cada niño, con información individual de Infantil y las mismas palabras para describir su avance.',
        noDataText
      ]
    };
    const mapText = (area, questionId) => mapTexts[area][answerIndex(questionId)] || noDataText;

    const crosses = [];
    const addCross = (condition, text, areas) => {
      if (condition && crosses.length < 3) crosses.push({ text, areas });
    };
    const p1 = answerIndex('preocupacion');
    addCross(p1 === 4 && scores.criterios != null && scores.criterios <= 3,
      'Lo que os preocupa se explica en vuestras propias respuestas: todavía no hay criterios para alfabetizar que vayan de Infantil a Primaria. Mientras falten, cada aula seguirá a su manera, por mucho compromiso que tenga el equipo.', ['criterios']);
    addCross(p1 === 3 && scores.ritmo != null && scores.ritmo <= 2,
      'Parte de los niños que «no avanzan» quizá solo necesita más tiempo del que marca el calendario. Cuando la expectativa llega pronto, quien va a otro ritmo parece ir por detrás.', ['ritmo']);
    addCross(p1 === 0 && scores.datos != null && scores.datos <= 2,
      'Os preocupan los resultados externos, pero el centro no tiene un dato propio que los anticipe: el problema se descubre cuando llega la prueba, y no antes.', ['datos']);
    addCross(p1 === 1 && scores.datos != null && scores.datos <= 2,
      'Cuando una familia pregunta cómo va su hijo, la respuesta se apoya en la impresión de quien le da clase. Dos familias con la misma duda pueden escuchar mensajes distintos, y eso alimenta la desconfianza.', ['datos']);
    addCross(p1 === 2 && scores.formacion != null && scores.formacion >= 3,
      'El equipo ya se ha formado. Antes de sumar otro curso, vale la pena ver qué ayuda necesita para llevar lo aprendido al aula.', ['formacion']);

    addCross(scores.ritmo != null && scores.ritmo <= 2 && scores.deteccion != null && scores.deteccion <= 2,
      'Cuando se espera que lean pronto y cada aula observa con sus propias señales, cuesta distinguir una dificultad real de un ritmo distinto. El riesgo es doble: derivar casos que no lo necesitan y no ver a tiempo los que sí.', ['ritmo', 'deteccion']);
    addCross(scores.ritmo != null && scores.ritmo <= 2 && scores.continuidad != null && scores.continuidad <= 3,
      'Infantil adelanta y 1º arranca por su cuenta: el niño vive dos ritmos que no se hablan. Lo aprendido deprisa no siempre está consolidado, y 1º no siempre lo sabe.', ['ritmo', 'continuidad']);
    addCross(scores.formacion === 3 && scores.criterios != null && scores.criterios <= 3,
      'La formación llegó al claustro, pero no se convirtió en acuerdos de aula. Lo aprendido existe en el equipo y todavía no ha cambiado lo que se hace cada día.', ['formacion', 'criterios']);
    addCross(scores.criterios === 2 && scores.continuidad != null && scores.continuidad <= 3,
      'El libro ordena cada curso, pero no garantiza la continuidad. Si Infantil y Primaria trabajan con materiales de lógicas distintas, el recorrido se rompe en el paso de etapa.', ['criterios', 'continuidad']);
    addCross(answerIndex('deteccion') === 1 && scores.datos != null && scores.datos <= 2,
      'Vuestro equipo ve cosas, pero lo que observa no queda registrado: la información se queda en cada aula y no llega a las decisiones del centro.', ['deteccion', 'datos']);
    addCross(scores.ritmo === 4 && scores.continuidad != null && scores.continuidad <= 2,
      'Hay una mirada de proceso, pero se rompe en el paso a 1º: lo que Infantil cuida, Primaria no siempre lo recoge.', ['ritmo', 'continuidad']);
    const noDataCount = Object.values(scores).filter(value => value == null).length;
    addCross(noDataCount >= 3,
      'Lo más significativo de este informe es lo que no se sabe. Suele indicar que la información sobre la alfabetización no circula hasta el equipo directivo.', ['pocos_datos']);

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
        description: 'Sin un dato que se pueda comparar, el centro decide a ciegas.',
        foundation: 'El dato permite saber si algo funciona y dónde poner los apoyos.',
        students: 'Los apoyos llegan cuando la dificultad ya es evidente.',
        center: 'Sorpresas en las evaluaciones externas y respuestas distintas ante las mismas preguntas de las familias.'
      },
      formacion: {
        title: 'Formación que llega al aula',
        description: 'Formar no basta si lo aprendido no se convierte en práctica de aula.',
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

    const fixedBlocks = {
      formacion: {
        intro: '¿Por qué organizar otra formación no suele ser suficiente? Una formación puntual, por buena que sea, se diluye cuando cada docente vuelve a su aula y la aplica desde su propia práctica. El claustro suma horas de formación, pero lo que pasa en el aula cambia poco.',
        bullets: [
          'Una formación común centrada en cómo progresa la alfabetización, no en actividades sueltas.',
          'Que esa formación termine en acuerdos concretos de aula: qué se trabaja, en qué orden y cómo se observa.',
          'Material de referencia que el equipo pueda consultar después, para que lo aprendido no dependa de la memoria de cada docente.',
          'Seguimiento durante el curso, para ajustar en el aula lo que en la formación parecía claro.'
        ],
        idea: 'que la formación recibida no se convierte en práctica compartida de aula',
        keywords: 'formación común, acuerdos concretos de aula, material de referencia, seguimiento durante el curso'
      },
      criterios: {
        intro: '¿Por qué una reunión de etapa no suele ser suficiente? Los acuerdos que se toman sin una base común acaban interpretándose desde la formación de cada docente. El acuerdo existe en el papel, pero en el aula vuelve a depender de cada tutora.',
        bullets: [
          'Una formación común del claustro sobre cómo progresa la alfabetización, de Infantil a Primaria.',
          'Una secuencia y un material de referencia compartidos, para que todo el equipo sepa qué se trabaja y en qué orden.',
          'Herramientas de observación comunes, para que «no asocia sonidos y letras» signifique lo mismo en todas las aulas.',
          'Acompañamiento durante la puesta en práctica, porque lo que cambia el aula es lo que se sostiene en el tiempo, no la formación de un día.'
        ],
        idea: 'que no hay criterios compartidos sobre qué enseñar, en qué orden y cómo observarlo',
        keywords: 'formación común del claustro, secuencia y material de referencia compartidos, herramientas de observación comunes, acompañamiento en la puesta en práctica'
      },
      ritmo: {
        intro: '¿Por qué cambiar la fecha no suele ser suficiente? Mover la expectativa de lectura un trimestre antes o después no cambia nada si el equipo no sabe qué tiene que estar consolidado antes de leer. Sin esa referencia, adelantar genera presión y esperar genera retrasos.',
        bullets: [
          'Una referencia común de las habilidades que sostienen la lectura y del momento en que es esperable cada una.',
          'Trabajo sistemático de esas habilidades en Infantil, para que la lectura llegue cuando hay base y no cuando lo marca el calendario.',
          'Formas sencillas de ver en qué punto está cada niño, para distinguir un ritmo distinto de una dificultad.',
          'Un mensaje común para las familias sobre cuándo y cómo se espera que sus hijos lean.'
        ],
        idea: 'distinguir un ritmo distinto de una dificultad real',
        keywords: 'referencia común de habilidades, trabajo sistemático en Infantil, ver en qué punto está cada niño, mensaje común para las familias'
      },
      datos: {
        intro: '¿Por qué pasar una prueba no suele ser suficiente? Una prueba aislada da un número, pero no dice qué hacer con él. Si el equipo no comparte qué mide ni cómo leerlo, el dato acaba en un informe y las decisiones se siguen tomando por impresión.',
        bullets: [
          'Acordar qué indicadores de lectura importan en cada momento, de Infantil 5 a 2º.',
          'Unas pocas observaciones sencillas y comunes en momentos fijos del curso, no una batería de pruebas.',
          'Un registro compartido que acompañe al alumno de un curso a otro.',
          'Espacios del equipo para leer esos datos juntos y decidir apoyos, agrupamientos y prioridades.'
        ],
        idea: 'que el centro decide sin un dato común y a tiempo sobre cómo avanza la lectura',
        keywords: 'indicadores de lectura, observaciones en momentos fijos, registro compartido, espacios del equipo para leer los datos'
      },
      deteccion: {
        intro: '¿Por qué derivar antes no suele ser suficiente? Orientación no puede valorar a todos los niños que despiertan una duda, y la mayoría de las señales tempranas no piden una derivación, sino una respuesta en el aula. Si el aula no sabe qué observar ni qué trabajar, la detección sigue llegando tarde o se queda en una derivación sin contexto.',
        bullets: [
          'Señales comunes: todo el equipo de Infantil y 1º sabe qué observar y cuándo es esperable cada cosa.',
          'Un registro sencillo de lo observado, que no dependa de la memoria de quien lo vio.',
          'Trabajo preventivo en el aula sobre las habilidades que todavía no están consolidadas, antes de pensar en derivar.',
          'Una ruta de derivación clara: cuándo se consulta a orientación, con qué información y quién informa a la familia.'
        ],
        idea: 'que las dificultades se ven tarde o sin una respuesta concreta en el aula',
        keywords: 'señales comunes, qué observar, registro de lo observado, trabajo preventivo, ruta de derivación'
      },
      continuidad: {
        intro: '¿Por qué una reunión de traspaso en junio no suele ser suficiente? En una reunión de final de curso se habla de los casos que más preocupan, y la información sobre el resto se pierde. Y si Infantil y 1º no comparten cómo se enseña a leer, aunque la información llegue, la tutora de 1º no sabe desde dónde retomar.',
        bullets: [
          'Una secuencia de alfabetización que vaya de Infantil a Primaria, para que 1º continúe y no empiece de nuevo.',
          'Un lenguaje común entre etapas: que «lee de forma autónoma» o «asocia sonidos y letras» signifique lo mismo para las dos tutoras.',
          'Un registro breve por alumno que pase con él de etapa.',
          'Una transición planificada en la forma de trabajar, para que el paso del juego y la manipulación a la ficha y el libro no sea brusco.'
        ],
        idea: 'que el paso de Infantil a 1º no parte de lo que cada niño ya domina',
        keywords: 'secuencia de Infantil a Primaria, lenguaje común entre etapas, registro breve por alumno, transición planificada'
      }
    };
    const fixedBlock = fixedBlocks[priorityArea] || null;
    const detectionAnswer = answerIndex('deteccion');
    let detectionVariant = '';
    if (priorityArea === 'deteccion') {
      if (detectionAnswer === 0) {
        detectionVariant = 'En vuestro caso, las dificultades aparecen cuando el alumno ya va por detrás. Lo que falta es mirar antes, y con las mismas señales en todo el equipo.';
      } else if (detectionAnswer >= 1 && detectionAnswer <= 3) {
        detectionVariant = 'En vuestro caso, el equipo ya detecta en Infantil. Lo que falta es que esa detección se convierta en una respuesta concreta en el aula.';
      }
    }
    const fixedFoundation = fixedBlock
      ? [fixedBlock.intro].concat(detectionVariant ? [detectionVariant] : []).concat(fixedBlock.bullets.map(item => '- ' + item)).join('\n')
      : priority.foundation;

    const p5 = answerIndex('infantil_5');
    const earlyLetters = p5 === 0 || p5 === 1;
    const structuredBase = p5 === 2 || p5 === 3;
    const earlyReading = answerIndex('ritmo') === 0 || answerIndex('ritmo') === 1;
    const firstGradeFromScratch = answerIndex('continuidad') === 0 || answerIndex('continuidad') === 1;
    const firstGradeBuildsOn = answerIndex('continuidad') === 3;
    const lateOrLooseTracking = detectionAnswer === 0 || answerIndex('datos') === 0 || answerIndex('datos') === 1;
    const p5Guidance = [];
    if (earlyLetters && earlyReading) p5Guidance.push('El foco de Infantil 5 en letras, fichas o palabras coincide con una expectativa de lectura temprana: plantea con cautela si la secuencia prioriza la rapidez sobre la consolidación de las bases, sin afirmar que esas bases falten.');
    if (earlyLetters && firstGradeFromScratch) p5Guidance.push('Ese foco de Infantil 5 se combina con un inicio de 1º desde el libro o según cada docente: puedes señalar el riesgo de que una secuencia poco explícita no tenga continuidad suficiente al pasar a Primaria.');
    if (structuredBase && firstGradeBuildsOn) p5Guidance.push('Infantil 5 trabaja el lenguaje oral, los sonidos o una secuencia planificada y 1º parte de lo trabajado con criterios compartidos: puede reconocerse una trayectoria potencialmente coherente, sin presentarla como garantía de resultados.');
    if (structuredBase && firstGradeFromScratch) p5Guidance.push('Infantil 5 tiene una preparación estructurada, pero 1º empieza desde el libro o según cada docente: puedes señalar que lo trabajado podría no aprovecharse plenamente.');
    if (earlyLetters && lateOrLooseTracking) p5Guidance.push('El foco temprano en letras, fichas o palabras coincide con una detección tardía o un seguimiento poco compartido: puedes abrir una pregunta sobre cómo se revisa la secuencia y cómo se identifican señales tempranas, sin atribuir causalidad.');

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
      'El mapa señala dónde concentrar la conversación del equipo y qué acciones de las que ya existen conviene alinear.',
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
        ? 'Sobre esto se puede construir sin empezar de cero.'
        : 'Es un punto de partida desde el que ordenar prioridades y tomar decisiones como equipo.',
      ANALISIS_FORMACION_AULA: mapText('formacion', 'formacion'),
      ...pointFieldsFor('FORMACION', scores.formacion),
      ESTADO_FORMACION: stateFor(scores.formacion),
      ANALISIS_CRITERIOS_COMUNES: mapText('criterios', 'criterios'),
      ...pointFieldsFor('CRITERIOS', scores.criterios),
      ESTADO_CRITERIOS: stateFor(scores.criterios),
      ANALISIS_RITMO_ALFABETIZACION: mapText('ritmo', 'ritmo'),
      ...pointFieldsFor('RITMO', scores.ritmo),
      ESTADO_RITMO: stateFor(scores.ritmo),
      ANALISIS_DATOS_PARA_DECIDIR: mapText('datos', 'datos'),
      ...pointFieldsFor('DATOS', scores.datos),
      ESTADO_DATOS: stateFor(scores.datos),
      ANALISIS_DETECCION_TEMPRANA: mapText('deteccion', 'deteccion'),
      ...pointFieldsFor('DETECCION', scores.deteccion),
      ESTADO_DETECCION: stateFor(scores.deteccion),
      ANALISIS_CONTINUIDAD_ENTRE_ETAPAS: mapText('continuidad', 'continuidad'),
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
      RESPUESTA_PREOCUPACION_PRINCIPAL: answerText('preocupacion'),
      RESPUESTA_FORMACION_CLAUSTRO: answerText('formacion'),
      RESPUESTA_CRITERIOS_NUEVO_DOCENTE: answerText('criterios'),
      RESPUESTA_MOMENTO_LECTURA_AUTONOMA: answerText('ritmo'),
      RESPUESTA_TRABAJO_INFANTIL_5: answerText('infantil_5'),
      RESPUESTA_CONTINUIDAD_ENTRE_ETAPAS: answerText('continuidad'),
      RESPUESTA_DETECCION_DIFICULTADES: answerText('deteccion'),
      RESPUESTA_MEDICION_LECTURA_AUTONOMA: answerText('datos'),
      RESPUESTA_MEJORA_PRIORITARIA: answerText('mejora'),
      RESPUESTA_PLAN_FORMACION: answerText('plan_formacion'),
      INTRO_FIJA: 'Este informe se elaboró con las respuestas que compartisteis con Lectolúdica y parte de lo que más os preocupa: ' + concern + '.',
      FUNDAMENTO_FIJO: fixedFoundation,
      IDEA_PRIORIDAD: fixedBlock ? fixedBlock.idea : '',
      PALABRAS_RESERVADAS: fixedBlock ? fixedBlock.keywords : '',
      ORIENTACION_P5: p5Guidance.join(' ')
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
        VERSION_REGLAS: '2026-10-30',
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

    const questionsStart = template.indexOf('  get questions() { return [');
    const questionsEnd = template.indexOf('  componentDidMount() {', questionsStart);
    if (questionsStart === -1 || questionsEnd === -1) {
      throw new Error('No se encontró el bloque original de preguntas.');
    }
    template = template.slice(0, questionsStart) + questionsLogic + template.slice(questionsEnd);

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
